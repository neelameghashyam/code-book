import { TestBed } from '@angular/core/testing';
import { PincodesService } from './pincodes.service';
import { PincodeStore } from './pincodes.store';
import { Pincode } from './pincode';
import { signal, WritableSignal } from '@angular/core';

interface PincodeStoreMock {
  pincodes: WritableSignal<Pincode[]>;
  filteredPincodes: WritableSignal<Pincode[]>;
  paginatedPincodes: WritableSignal<Pincode[]>;
  totalPages: WritableSignal<number>;
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  isLoading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loadPincodes: jest.Mock<Promise<Pincode[]>>;
  addPincode: jest.Mock<Pincode, [Omit<Pincode, 'id'>]>;
  updatePincode: jest.Mock<void, [Pincode]>;
  deletePincode: jest.Mock<void, [number]>;
  setPage: jest.Mock<void, [number]>;
  setPageSize: jest.Mock<void, [number]>;
  setSearchQuery: jest.Mock<void, [string]>;
  sortPincodes: jest.Mock<void, [string, 'asc' | 'desc']>;
}

describe('PincodesService', () => {
  let service: PincodesService;
  let pincodeStore: PincodeStoreMock;

  const mockPincodes: Pincode[] = [
    {
      id: 1,
      officeName: 'Office1',
      pincode: '123456',
      districtName: 'District1',
      taluk: 'Taluk1',
      stateName: 'State1',
      city: 'City1',
    },
    {
      id: 2,
      officeName: 'Office2',
      pincode: '654321',
      districtName: 'District2',
      taluk: 'Taluk2',
      stateName: 'State2',
      city: 'City2',
    },
  ];

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(localStorageMock.getItem);
    jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(localStorageMock.setItem);

    // Mock PincodeStore
    const pincodeStoreMock: PincodeStoreMock = {
      pincodes: signal(mockPincodes),
      filteredPincodes: signal(mockPincodes),
      paginatedPincodes: signal(mockPincodes),
      totalPages: signal(1),
      currentPage: signal(1),
      pageSize: signal(10),
      isLoading: signal(false),
      error: signal(null),
      loadPincodes: jest.fn().mockResolvedValue(mockPincodes),
      addPincode: jest.fn().mockImplementation(pincode => ({
        id: Date.now(),
        ...pincode,
      })),
      updatePincode: jest.fn(),
      deletePincode: jest.fn(),
      setPage: jest.fn(),
      setPageSize: jest.fn(),
      setSearchQuery: jest.fn(),
      sortPincodes: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PincodesService,
        { provide: PincodeStore, useValue: pincodeStoreMock },
      ],
    });

    service = TestBed.inject(PincodesService);
    pincodeStore = pincodeStoreMock;
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals', () => {
    it('should expose pincodes signal', () => {
      expect(service.pincodes()).toEqual(mockPincodes);
    });

    it('should expose filteredPincodes signal', () => {
      pincodeStore.filteredPincodes.set([mockPincodes[0]]);
      expect(service.filteredPincodes()).toEqual([mockPincodes[0]]);
    });

    it('should expose paginatedPincodes signal', () => {
      pincodeStore.paginatedPincodes.set([mockPincodes[0]]);
      expect(service.paginatedPincodes()).toEqual([mockPincodes[0]]);
    });

    it('should expose totalPages signal', () => {
      pincodeStore.totalPages.set(2);
      expect(service.totalPages()).toEqual(2);
    });

    it('should expose currentPage signal', () => {
      pincodeStore.currentPage.set(2);
      expect(service.currentPage()).toEqual(2);
    });

    it('should expose pageSize signal', () => {
      pincodeStore.pageSize.set(20);
      expect(service.pageSize()).toEqual(20);
    });

    it('should expose isLoading signal', () => {
      pincodeStore.isLoading.set(true);
      expect(service.isLoading()).toEqual(true);
    });

    it('should expose error signal', () => {
      pincodeStore.error.set('Test error');
      expect(service.error()).toEqual('Test error');
    });
  });

  describe('getPincodes', () => {
    it('should call loadPincodes and update pincodes', async () => {
      await service.getPincodes();
      expect(pincodeStore.loadPincodes).toHaveBeenCalled();
      expect(service.pincodes()).toEqual(mockPincodes);
    });

    it('should load pincodes from localStorage if available', async () => {
      const storedPincodes = JSON.stringify(mockPincodes);
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(storedPincodes);
      pincodeStore.loadPincodes.mockImplementation(() => {
        pincodeStore.pincodes.set(JSON.parse(storedPincodes));
        return Promise.resolve(mockPincodes);
      });
      await service.getPincodes();
      expect(pincodeStore.loadPincodes).toHaveBeenCalled();
      expect(service.pincodes()).toEqual(mockPincodes);
    });
  });

  describe('addPincode', () => {
    it('should add a pincode and return it', async () => {
      const newPincode: Omit<Pincode, 'id'> = {
        officeName: 'Office3',
        pincode: '789012',
        districtName: 'District3',
        taluk: 'Taluk3',
        stateName: 'State3',
        city: 'City3',
      };
      const addedPincode = await service.addPincode(newPincode);
      expect(pincodeStore.addPincode).toHaveBeenCalledWith(newPincode);
      expect(addedPincode.id).toBeDefined();
      expect(addedPincode.officeName).toEqual('Office3');
    });
  });

  describe('updatePincode', () => {
    it('should update a pincode', async () => {
      const updatedPincode: Pincode = {
        ...mockPincodes[0],
        officeName: 'Updated Office',
      };
      await service.updatePincode(updatedPincode);
      expect(pincodeStore.updatePincode).toHaveBeenCalledWith(updatedPincode);
    });
  });

  describe('deletePincode', () => {
    it('should delete a pincode', async () => {
      await service.deletePincode(1);
      expect(pincodeStore.deletePincode).toHaveBeenCalledWith(1);
    });
  });

  describe('setPage', () => {
    it('should set the current page', () => {
      service.setPage(2);
      expect(pincodeStore.setPage).toHaveBeenCalledWith(2);
    });
  });

  describe('setPageSize', () => {
    it('should set page size', () => {
      service.setPageSize(5);
      expect(pincodeStore.setPageSize).toHaveBeenCalledWith(5);
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      service.setSearchQuery('Office2');
      expect(pincodeStore.setSearchQuery).toHaveBeenCalledWith('Office2');
    });
  });

  describe('sortPincodes', () => {
    it('should sort pincodes by field in ascending order', () => {
      service.sortPincodes('pincode', 'asc');
      expect(pincodeStore.sortPincodes).toHaveBeenCalledWith('pincode', 'asc');
    });

    it('should sort pincodes by field in descending order', () => {
      service.sortPincodes('pincode', 'desc');
      expect(pincodeStore.sortPincodes).toHaveBeenCalledWith('pincode', 'desc');
    });
  });
});