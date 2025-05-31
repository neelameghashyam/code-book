import { TestBed } from '@angular/core/testing';
import { BusinessStore } from './business.store';
import { Business } from '../business.model';

// Create a mock Business type that matches your actual Business interface
type MockBusiness = Omit<Business, 'id'> & { id?: string };

describe('BusinessStore', () => {
  let store: InstanceType<typeof BusinessStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(BusinessStore);
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have initial state', () => {
      expect(store.businesses()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.businessCount()).toBe(0);
    });
  });

  describe('loadBusinesses', () => {
    it('should load businesses from localStorage', () => {
      const mockBusiness: MockBusiness = {
        id: '1',
        name: 'Test Business',
        category: 'Tech',
        subCategory: 'Software',
        country: 'USA',
        phone: '123-456-7890'
      };
      localStorage.setItem('businesses', JSON.stringify([mockBusiness]));

      store.loadBusinesses();

      expect(store.businesses().length).toBe(1);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle empty localStorage', () => {
      store.loadBusinesses();
      expect(store.businesses()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle parsing error', () => {
      localStorage.setItem('businesses', 'invalid json');
      
      store.loadBusinesses();

      expect(store.businesses()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to load businesses');
    });
  });

  describe('addBusiness', () => {
    it('should add a new business', () => {
      const newBusiness: MockBusiness = {
        name: 'New Business',
        category: 'Retail',
        subCategory: 'Clothing',
        country: 'UK',
        phone: '987-654-3210'
      };
      
      store.addBusiness(newBusiness as Business);

      expect(store.businesses().length).toBe(1);
      expect(store.businesses()[0].name).toBe('New Business');
      expect(store.businesses()[0].id).toBeDefined();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      
      const storedData = localStorage.getItem('businesses');
      expect(storedData).toBeTruthy();
      if (storedData) {
        expect(JSON.parse(storedData).length).toBe(1);
      }
    });

    it('should handle error when adding business', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const newBusiness: MockBusiness = {
        name: 'New Business',
        category: 'Retail',
        subCategory: 'Clothing',
        country: 'UK',
        phone: '987-654-3210'
      };
      store.addBusiness(newBusiness as Business);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to add business');
    });
  });

  describe('updateBusiness', () => {
    const initialBusiness: MockBusiness = {
      id: '1',
      name: 'Old Name',
      category: 'Tech',
      subCategory: 'Hardware',
      country: 'USA',
      phone: '123-456-7890'
    };

    beforeEach(() => {
      localStorage.setItem('businesses', JSON.stringify([initialBusiness]));
      store.loadBusinesses();
    });

    it('should update an existing business', () => {
      const updatedBusiness: MockBusiness = {
        ...initialBusiness,
        name: 'New Name'
      };
      
      store.updateBusiness(updatedBusiness as Business);

      expect(store.businesses().length).toBe(1);
      expect(store.businesses()[0].name).toBe('New Name');
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      
      const storedData = localStorage.getItem('businesses');
      expect(storedData).toBeTruthy();
      if (storedData) {
        expect(JSON.parse(storedData)[0].name).toBe('New Name');
      }
    });

    it('should handle business not found', () => {
      const nonExistentBusiness: MockBusiness = {
        id: '999',
        name: 'Nonexistent',
        category: 'Tech',
        subCategory: 'Software',
        country: 'USA',
        phone: '000-000-0000'
      };
      
      store.updateBusiness(nonExistentBusiness as Business);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to update business');
    });

    it('should handle storage error', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const updatedBusiness: MockBusiness = {
        ...initialBusiness,
        name: 'New Name'
      };
      store.updateBusiness(updatedBusiness as Business);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to update business');
    });
  });

  describe('deleteBusiness', () => {
    const businessToKeep: MockBusiness = {
      id: '1',
      name: 'Keep Me',
      category: 'Tech',
      subCategory: 'Software',
      country: 'USA',
      phone: '123-456-7890'
    };
    const businessToDelete: MockBusiness = {
      id: '2',
      name: 'Delete Me',
      category: 'Retail',
      subCategory: 'Clothing',
      country: 'UK',
      phone: '987-654-3210'
    };

    beforeEach(() => {
      localStorage.setItem('businesses', JSON.stringify([businessToKeep, businessToDelete]));
      store.loadBusinesses();
    });

    it('should delete a business', () => {
      store.deleteBusiness(businessToDelete.id!);

      expect(store.businesses().length).toBe(1);
      expect(store.businesses()[0].id).toBe(businessToKeep.id);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      
      const storedData = localStorage.getItem('businesses');
      expect(storedData).toBeTruthy();
      if (storedData) {
        expect(JSON.parse(storedData).length).toBe(1);
      }
    });

    it('should handle storage error', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      store.deleteBusiness(businessToDelete.id!);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to delete business');
    });

    it('should not fail when deleting non-existent business', () => {
      store.deleteBusiness('non-existent-id');

      expect(store.businesses().length).toBe(2);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });

  describe('getBusiness', () => {
    const testBusiness: MockBusiness = {
      id: '123',
      name: 'Test Business',
      category: 'Tech',
      subCategory: 'Software',
      country: 'USA',
      phone: '123-456-7890'
    };

    beforeEach(() => {
      localStorage.setItem('businesses', JSON.stringify([testBusiness]));
      store.loadBusinesses();
    });

    it('should get a business by id', () => {
      const result = store.getBusiness('123');
      expect(result).toEqual(testBusiness);
      expect(store.error()).toBeNull();
    });

    it('should return undefined for non-existent id', () => {
      const result = store.getBusiness('999');
      expect(result).toBeUndefined();
      expect(store.error()).toBeNull();
    });

    it('should set error if something goes wrong', () => {
      jest.spyOn(Array.prototype, 'find').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = store.getBusiness('123');
      expect(result).toBeUndefined();
      expect(store.error()).toBe('Failed to fetch business with ID 123');
    });
  });

  describe('businessCount', () => {
    it('should return correct count of businesses', () => {
      expect(store.businessCount()).toBe(1);
      
      const mockBusinesses: MockBusiness[] = [
        {
          id: '1',
          name: 'Business 1',
          category: 'Tech',
          subCategory: 'Software',
          country: 'USA',
          phone: '123-456-7890'
        },
        {
          id: '2',
          name: 'Business 2',
          category: 'Retail',
          subCategory: 'Clothing',
          country: 'UK',
          phone: '987-654-3210'
        }
      ];
      localStorage.setItem('businesses', JSON.stringify(mockBusinesses));
      store.loadBusinesses();
      
      expect(store.businessCount()).toBe(2);
    });
  });

  describe('onInit', () => {
    it('should load businesses on initialization', () => {
      const mockBusiness: MockBusiness = {
        id: '1',
        name: 'Initial Business',
        category: 'Tech',
        subCategory: 'Software',
        country: 'USA',
        phone: '123-456-7890'
      };
      localStorage.setItem('businesses', JSON.stringify([mockBusiness]));
      
      const newStore = TestBed.inject(BusinessStore);
      
      expect(newStore.businesses().length)
    });
  });
});