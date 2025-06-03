import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PincodeStore } from './pincodes.store';
import { Pincode } from './pincode';

describe('PincodeStore', () => {
  let store: InstanceType<typeof PincodeStore>;
  let httpClientMock: jest.Mocked<HttpClient>;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });

    // Mock HttpClient
    httpClientMock = {
      get: jest.fn().mockReturnValue(of([])),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        PincodeStore,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });
    store = TestBed.inject(PincodeStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct initial state', () => {
    expect(store.pincodes()).toEqual([]);
    expect(store.initialized())
    expect(store.error()).toBe(null);
    expect(store.currentPage())
    expect(store.pageSize())
    expect(store.searchQuery())
    expect(store.isLoading())
    expect(store.sortField())
    expect(store.sortDirection())
  });

  it('should load pincodes from localStorage on init', async () => {
    const mockPincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'Office1',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(mockPincodes);

    await store.loadPincodes();

    expect(store.pincodes()).toEqual(mockPincodes);
    expect(store.initialized()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should load pincodes from API when localStorage is empty', async () => {
    const mockPincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'Office1',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
    ];
    httpClientMock.get.mockReturnValue(of(mockPincodes));

    await store.loadPincodes();

    expect(httpClientMock.get).toHaveBeenCalledWith('https://dbapiservice.onrender.com/dbapis/v1/pincodes');
    expect(store.pincodes())
    expect(store.initialized())
    expect(store.isLoading());
    expect(store.error())
    expect(JSON.parse(localStorageMock['pincodes']))
  });

  it('should handle loadPincodes error', async () => {
    httpClientMock.get.mockReturnValue(throwError(() => new Error('API error')));

    try {
      await store.loadPincodes();
    } catch (error) {
      expect(store.error()).toBe('API error');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should add a new pincode', async () => {
    const newPincode: Omit<Pincode, 'id'> = {
      pincode: '654321',
      officeName: 'Office2',
      districtName: 'District2',
      taluk: 'Taluk2',
      stateName: 'State2',
      city: 'City2',
    };

    const result = await store.addPincode(newPincode);

    expect(store.pincodes().length).toBe(1);
    expect(store.pincodes()[0]).toMatchObject({
      ...newPincode,
      id: expect.any(Number),
    });
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['pincodes'])).toHaveLength(1);
    expect(result).toMatchObject({
      ...newPincode,
      id: expect.any(Number),
    });
  });

  it('should handle addPincode error', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Add error');
    });

    const newPincode: Omit<Pincode, 'id'> = {
      pincode: '654321',
      officeName: 'Office2',
      districtName: 'District2',
      taluk: 'Taluk2',
      stateName: 'State2',
      city: 'City2',
    };

    try {
      await store.addPincode(newPincode);
    } catch (error) {
      expect(store.error()).toBe('Add error');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should update an existing pincode', async () => {
    const initialPincode: Pincode = {
      id: 1,
      pincode: '123456',
      officeName: 'Office1',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    };
    localStorageMock['pincodes'] = JSON.stringify([initialPincode]);
    await store.loadPincodes();

    const updatedPincode: Pincode = {
      ...initialPincode,
      officeName: 'UpdatedOffice',
      city: 'UpdatedCity',
    };

    await store.updatePincode(updatedPincode);

    expect(store.pincodes()[0]).toMatchObject(updatedPincode);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['pincodes'])[0].officeName).toBe('UpdatedOffice');
  });

  it('should handle updatePincode error', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Update error');
    });

    const pincode: Pincode = {
      id: 1,
      pincode: '123456',
      officeName: 'Office1',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    };

    try {
      await store.updatePincode(pincode);
    } catch (error) {
      expect(store.error()).toBe('Update error');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should handle updatePincode error with default message', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw {};
    });

    const pincode: Pincode = {
      id: 1,
      pincode: '123456',
      officeName: 'Office1',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    };

    try {
      await store.updatePincode(pincode);
    } catch (error) {
      expect(store.error()).toBe('Failed to update pincode');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should update pincode when localStorage is empty', async () => {
    const pincode: Pincode = {
      id: 1,
      pincode: '123456',
      officeName: 'Office1',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    };

    await store.updatePincode(pincode);

    expect(store.pincodes()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should delete a pincode', async () => {
    const pincode: Pincode = {
      id: 1,
      pincode: '123456',
      officeName: 'Office1',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    };
    localStorageMock['pincodes'] = JSON.stringify([pincode]);
    await store.loadPincodes();

    await store.deletePincode(1);

    expect(store.pincodes()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['pincodes'])).toEqual([]);
  });

  it('should handle deletePincode error', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Delete error');
    });

    try {
      await store.deletePincode(1);
    } catch (error) {
      expect(store.error()).toBe('Delete error');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should handle deletePincode error with default message', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw {};
    });

    try {
      await store.deletePincode(1);
    } catch (error) {
      expect(store.error()).toBe('Failed to delete pincode');
      expect(store.isLoading()).toBe(false);
    }
  });

  it('should delete pincode when localStorage is empty', async () => {
    await store.deletePincode(1);

    expect(store.pincodes()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should set page', () => {
    store.setPage(2);
    expect(store.currentPage()).toBe(2);
  });

  it('should set page size and reset current page', () => {
    store.setPageSize(20);
    expect(store.pageSize()).toBe(20);
    expect(store.currentPage()).toBe(1);
  });

  it('should set search query and reset current page', () => {
    store.setSearchQuery('test');
    expect(store.searchQuery()).toBe('test');
    expect(store.currentPage()).toBe(1);
  });

  it('should sort pincodes and reset current page', () => {
    store.sortPincodes('officeName', 'desc');
    expect(store.sortField()).toBe('officeName');
    expect(store.sortDirection()).toBe('desc');
    expect(store.currentPage()).toBe(1);
  });

  it('should filter pincodes by search query', async () => {
    const pincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'TestOffice',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
      {
        id: 2,
        pincode: '654321',
        officeName: 'OtherOffice',
        districtName: 'District2',
        taluk: 'Taluk2',
        stateName: 'State2',
        city: 'City2',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.setSearchQuery('test');

    expect(store.filteredPincodes()).toHaveLength(1);
    expect(store.filteredPincodes()[0].officeName).toBe('TestOffice');
  });

  it('should filter pincodes by pincode', async () => {
    const pincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'Office1',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
      {
        id: 2,
        pincode: '654321',
        officeName: 'Office2',
        districtName: 'District2',
        taluk: 'Taluk2',
        stateName: 'State2',
        city: 'City2',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.setSearchQuery('123');

    expect(store.filteredPincodes()).toHaveLength(1);
    expect(store.filteredPincodes()[0].pincode).toBe('123456');
  });

  it('should sort pincodes by officeName ascending', async () => {
    const pincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'BOffice',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
      {
        id: 2,
        pincode: '654321',
        officeName: 'AOffice',
        districtName: 'District2',
        taluk: 'Taluk2',
        stateName: 'State2',
        city: 'City2',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.sortPincodes('officeName', 'asc');

    expect(store.filteredPincodes()[0].officeName).toBe('AOffice');
    expect(store.filteredPincodes()[1].officeName).toBe('BOffice');
  });

  it('should sort pincodes by officeName descending', async () => {
    const pincodes: Pincode[] = [
      {
        id: 1,
        pincode: '123456',
        officeName: 'BOffice',
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
      {
        id: 2,
        pincode: '654321',
        officeName: 'AOffice',
        districtName: 'District2',
        taluk: 'Taluk2',
        stateName: 'State2',
        city: 'City2',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.sortPincodes('officeName', 'desc');

    expect(store.filteredPincodes()[0].officeName).toBe('BOffice');
    expect(store.filteredPincodes()[1].officeName).toBe('AOffice');
  });

  it('should paginate pincodes', async () => {
    const pincodes: Pincode[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      pincode: `12345${i + 1}`,
      officeName: `Office${i + 1}`,
      districtName: `District${i + 1}`,
      taluk: `Taluk${i + 1}`,
      stateName: `State${i + 1}`,
      city: `City${i + 1}`,
    }));
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.setPageSize(5);
    store.setPage(2);

    expect(store.paginatedPincodes()).toHaveLength(5);
    expect(store.paginatedPincodes()[0].id).toBe(6);
    expect(store.totalPages()).toBe(3);
  });

  it('should return empty paginated pincodes when no data', () => {
    expect(store.paginatedPincodes()).toEqual([]);
    expect(store.totalPages()).toBe(0);
  });

  it('should handle null or undefined fields in pincode during filtering', async () => {
    const pincodes: Pincode[] = [
      {
        id: 1,
        pincode: null as any,
        officeName: undefined as any,
        districtName: 'District1',
        taluk: 'Taluk1',
        stateName: 'State1',
        city: 'City1',
      },
    ];
    localStorageMock['pincodes'] = JSON.stringify(pincodes);
    await store.loadPincodes();

    store.setSearchQuery('district1');

    expect(store.filteredPincodes()).toHaveLength(1);
    expect(store.filteredPincodes()[0].districtName).toBe('District1');
  });
});