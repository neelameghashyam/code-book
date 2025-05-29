import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PincodesService } from './pincodes.service';
import { PincodeStore } from './pincodes.store';
import { Pincode } from './pincode';

interface PincodeStoreMock {
  setPincodes?: jest.Mock;
  getPincodes?: jest.Mock;
  // Add other methods or properties as needed
}

describe('PincodesService', () => {
  let service: PincodesService;
  let httpTestingController: HttpTestingController;
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

  const apiUrl = 'https://dbapiservice.onrender.com/dbapis/v1/pincodes';

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(localStorageMock.getItem);
    jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(localStorageMock.setItem);

    // Mock PincodeStore
    const pincodeStoreMock = {
      setPincodes: jest.fn(),
      getPincodes: jest.fn().mockReturnValue(mockPincodes),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PincodesService,
        { provide: PincodeStore, useValue: pincodeStoreMock },
      ],
    });

    service = TestBed.inject(PincodesService);
    pincodeStore = TestBed.inject(PincodeStore) as unknown as PincodeStoreMock;
    httpTestingController = TestBed.inject(HttpTestingController);

    // Clear localStorage mock before each test
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals', () => {
    it('should expose pincodes signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.pincodes()).toEqual(mockPincodes);
    });

    it('should expose filteredPincodes signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      service.setSearchQuery('Office1');
      expect(service.filteredPincodes()).toEqual([mockPincodes[0]]);
    });

    it('should expose paginatedPincodes signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      service.setPageSize(1);
      service.setPage(1);
      expect(service.paginatedPincodes()).toEqual([mockPincodes[0]]);
    });

    it('should expose totalPages signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      service.setPageSize(1);
      expect(service.totalPages()).toEqual(2);
    });

    it('should expose currentPage signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      service.setPage(2);
      expect(service.currentPage()).toEqual(2);
    });

    it('should expose pageSize signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      service.setPageSize(20);
      expect(service.pageSize()).toEqual(20);
    });

    it('should expose isLoading signal', () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.getPincodes();
      expect(service.isLoading()).toEqual(true);
      httpTestingController.expectNone(apiUrl);
    });

    it('should expose error signal', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      const req = httpTestingController.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error'));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.error()).toEqual('Failed to load pincodes');
    });
  });

  describe('getPincodes', () => {
    it('should call loadPincodes and fetch pincodes from API', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      service.getPincodes();
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(mockPincodes);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.pincodes()).toEqual(mockPincodes);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('pincodes', JSON.stringify(mockPincodes));
    });

    it('should load pincodes from localStorage if available', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.getPincodes();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.pincodes()).toEqual(mockPincodes);
      httpTestingController.expectNone(apiUrl);
    });
  });

  describe('addPincode', () => {
    it('should add a pincode and update localStorage', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      const newPincode: Omit<Pincode, 'id'> = {
        officeName: 'Office3',
        pincode: '789012',
        districtName: 'District3',
        taluk: 'Taluk3',
        stateName: 'State3',
        city: 'City3',
      };
      const addedPincode = await service.addPincode(newPincode);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(addedPincode.id).toBeDefined();
      expect(service.pincodes()).toContainEqual(addedPincode);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('pincodes', expect.any(String));
    });
  });

  describe('updatePincode', () => {
    it('should update a pincode and save to localStorage', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      const updatedPincode: Pincode = {
        ...mockPincodes[0],
        officeName: 'Updated Office',
      };
      service.updatePincode(updatedPincode);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.pincodes().find(p => p.id === 1)?.officeName).toEqual('Updated Office');
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'pincodes',
        JSON.stringify(expect.arrayContaining([updatedPincode]))
      );
    });
  });

  describe('deletePincode', () => {
    it('should delete a pincode and update localStorage', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.deletePincode(1);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.pincodes()).toEqual([mockPincodes[1]]);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('pincodes', expect.any(String));
    });
  });

  describe('setPage', () => {
    it('should set the current page', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.setPage(2);
      expect(service.currentPage()).toEqual(2);
    });
  });

  describe('setPageSize', () => {
    it('should set page size and reset to page 1', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.setPageSize(5);
      expect(service.pageSize()).toEqual(5);
      expect(service.currentPage()).toEqual(1);
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query and reset to page 1', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.setSearchQuery('Office2');
      expect(service.filteredPincodes()).toEqual([mockPincodes[1]]);
      expect(service.currentPage()).toEqual(1);
    });
  });

  describe('sortPincodes', () => {
    it('should sort pincodes by field in ascending order', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.sortPincodes('pincode', 'asc');
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.filteredPincodes()).toEqual([mockPincodes[0], mockPincodes[1]]);
      expect(service.currentPage()).toEqual(1);
    });

    it('should sort pincodes by field in descending order', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify(mockPincodes));
      service.sortPincodes('pincode', 'desc');
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(service.filteredPincodes()).toEqual([mockPincodes[1], mockPincodes[0]]);
      expect(service.currentPage()).toEqual(1);
    });
  });
});