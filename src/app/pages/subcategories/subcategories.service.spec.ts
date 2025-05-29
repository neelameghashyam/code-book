import { TestBed } from '@angular/core/testing';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoryStore } from './subcategories.store';
import { Subcategory } from './subcategories';

// Mock SubcategoryStore
class MockSubcategoryStore {
  subcategories = jest.fn().mockReturnValue([]);
  filteredSubcategories = jest.fn().mockReturnValue([]);
  paginatedSubcategories = jest.fn().mockReturnValue([]);
  totalPages = jest.fn().mockReturnValue(0);
  currentPage = jest.fn().mockReturnValue(1);
  pageSize = jest.fn().mockReturnValue(10);
  isLoading = jest.fn().mockReturnValue(false);
  error = jest.fn().mockReturnValue(null);
  selectedCategoryId = jest.fn().mockReturnValue(null);
  loadSubcategories = jest.fn();
  addSubcategory = jest.fn();
  updateSubcategory = jest.fn();
  deleteSubcategory = jest.fn();
  setPage = jest.fn();
  setPageSize = jest.fn();
  setSearchQuery = jest.fn();
  sortSubcategories = jest.fn();
  setSelectedCategoryId = jest.fn();
}

describe('SubcategoriesService', () => {
  let service: SubcategoriesService;
  let mockSubcategoryStore: MockSubcategoryStore;

  beforeEach(() => {
    mockSubcategoryStore = new MockSubcategoryStore();

    TestBed.configureTestingModule({
      providers: [
        SubcategoriesService,
        { provide: SubcategoryStore, useValue: mockSubcategoryStore }
      ]
    });

    service = TestBed.inject(SubcategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize properties from subcategoryStore', () => {
    expect(service.subcategories).toBe(mockSubcategoryStore.subcategories);
    expect(service.filteredSubcategories).toBe(mockSubcategoryStore.filteredSubcategories);
    expect(service.paginatedSubcategories).toBe(mockSubcategoryStore.paginatedSubcategories);
    expect(service.totalPages).toBe(mockSubcategoryStore.totalPages);
    expect(service.currentPage).toBe(mockSubcategoryStore.currentPage);
    expect(service.pageSize).toBe(mockSubcategoryStore.pageSize);
    expect(service.isLoading).toBe(mockSubcategoryStore.isLoading);
    expect(service.error).toBe(mockSubcategoryStore.error);
    expect(service.selectedCategoryId).toBe(mockSubcategoryStore.selectedCategoryId);
  });

  it('should call loadSubcategories on getSubcategories', () => {
    service.getSubcategories();
    expect(mockSubcategoryStore.loadSubcategories).toHaveBeenCalled();
  });

  it('should call addSubcategory with subcategory data', () => {
    const subcategory: Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: 'Test comment',
      categoryId: 1,
      CategoryName: 'Test Category'
    };
    service.addSubcategory(subcategory);
    expect(mockSubcategoryStore.addSubcategory).toHaveBeenCalledWith(subcategory);
  });

  it('should call updateSubcategory with subcategory data', () => {
    const subcategory: Subcategory = {
      id: 1,
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Test comment',
      categoryId: 1,
      CategoryName: 'Test Category'
    };
    service.updateSubcategory(subcategory);
    expect(mockSubcategoryStore.updateSubcategory).toHaveBeenCalledWith(subcategory);
  });

  it('should call deleteSubcategory with id', () => {
    service.deleteSubcategory(1);
    expect(mockSubcategoryStore.deleteSubcategory).toHaveBeenCalledWith(1);
  });

  it('should call setPage with page number', () => {
    service.setPage(2);
    expect(mockSubcategoryStore.setPage).toHaveBeenCalledWith(2);
  });

  it('should call setPageSize with page size', () => {
    service.setPageSize(20);
    expect(mockSubcategoryStore.setPageSize).toHaveBeenCalledWith(20);
  });

  it('should call setSearchQuery with query', () => {
    service.setSearchQuery('test');
    expect(mockSubcategoryStore.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should call sortSubcategories with field and direction', () => {
    service.sortSubcategories('name', 'asc');
    expect(mockSubcategoryStore.sortSubcategories).toHaveBeenCalledWith('name', 'asc');

    service.sortSubcategories(null, 'desc');
    expect(mockSubcategoryStore.sortSubcategories).toHaveBeenCalledWith(null, 'desc');
  });

  it('should call setSelectedCategoryId with categoryId', () => {
    service.setSelectedCategoryId(1);
    expect(mockSubcategoryStore.setSelectedCategoryId).toHaveBeenCalledWith(1);

    service.setSelectedCategoryId(null);
    expect(mockSubcategoryStore.setSelectedCategoryId).toHaveBeenCalledWith(null);
  });
});