import { TestBed } from '@angular/core/testing';
import { CategoriesService } from './categories.service';
import { CategoryStore } from './categories.store';
import { Category } from './category';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryStore: jest.Mocked<InstanceType<typeof CategoryStore>>;

  const mockCategory: Category = {
    id: 1,
    name: 'TestCat',
    icon: 'icon1',
    imageUrl: 'url1',
    createdAt: '2023-01-01T00:00:00Z',
    modifiedAt: '2023-01-01T00:00:00Z',
    comments: 'Comment1',
  };

  beforeEach(() => {
    // Mock CategoryStore
    const storeMock = {
      categories: jest.fn().mockReturnValue([]),
      filteredCategories: jest.fn().mockReturnValue([]),
      paginatedCategories: jest.fn().mockReturnValue([]),
      totalPages: jest.fn().mockReturnValue(0),
      currentPage: jest.fn().mockReturnValue(1),
      pageSize: jest.fn().mockReturnValue(10),
      isLoading: jest.fn().mockReturnValue(false),
      error: jest.fn().mockReturnValue(null),
      loadCategories: jest.fn(),
      addCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      setPage: jest.fn(),
      setPageSize: jest.fn(),
      setSearchQuery: jest.fn(),
      sortCategories: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoryStore, useValue: storeMock },
      ],
    });

    service = TestBed.inject(CategoriesService);
    categoryStore = TestBed.inject(CategoryStore) as jest.Mocked<InstanceType<typeof CategoryStore>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return categories from store', () => {
    const mockCategories = [mockCategory];
    categoryStore.categories.mockReturnValue(mockCategories);

    expect(service.categories()).toEqual(mockCategories);
    expect(categoryStore.categories).toHaveBeenCalled();
  });

  it('should return filteredCategories from store', () => {
    const mockFilteredCategories = [mockCategory];
    categoryStore.filteredCategories.mockReturnValue(mockFilteredCategories);

    expect(service.filteredCategories()).toEqual(mockFilteredCategories);
    expect(categoryStore.filteredCategories).toHaveBeenCalled();
  });

  it('should return paginatedCategories from store', () => {
    const mockPaginatedCategories = [mockCategory];
    categoryStore.paginatedCategories.mockReturnValue(mockPaginatedCategories);

    expect(service.paginatedCategories()).toEqual(mockPaginatedCategories);
    expect(categoryStore.paginatedCategories).toHaveBeenCalled();
  });

  it('should return totalPages from store', () => {
    categoryStore.totalPages.mockReturnValue(3);

    expect(service.totalPages()).toBe(3);
    expect(categoryStore.totalPages).toHaveBeenCalled();
  });

  it('should return currentPage from store', () => {
    categoryStore.currentPage.mockReturnValue(2);

    expect(service.currentPage()).toBe(2);
    expect(categoryStore.currentPage).toHaveBeenCalled();
  });

  it('should return pageSize from store', () => {
    categoryStore.pageSize.mockReturnValue(20);

    expect(service.pageSize()).toBe(20);
    expect(categoryStore.pageSize).toHaveBeenCalled();
  });

  it('should return isLoading from store', () => {
    categoryStore.isLoading.mockReturnValue(true);

    expect(service.isLoading()).toBe(true);
    expect(categoryStore.isLoading).toHaveBeenCalled();
  });

  it('should return error from store', () => {
    categoryStore.error.mockReturnValue('Test error');

    expect(service.error()).toBe('Test error');
    expect(categoryStore.error).toHaveBeenCalled();
  });

  it('should call loadCategories on store', () => {
    service.getCategories();

    expect(categoryStore.loadCategories).toHaveBeenCalled();
  });

  it('should call addCategory on store and return result', () => {
    const newCategory: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewCat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
    };
    categoryStore.addCategory.mockReturnValue(mockCategory);

    const result = service.addCategory(newCategory);

    expect(categoryStore.addCategory).toHaveBeenCalledWith(newCategory);
    expect(result).toEqual(mockCategory);
  });

  it('should handle addCategory error', () => {
    const newCategory: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewCat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
    };
    categoryStore.addCategory.mockImplementation(() => {
      throw new Error('Add error');
    });

    expect(() => service.addCategory(newCategory)).toThrow('Add error');
    expect(categoryStore.addCategory).toHaveBeenCalledWith(newCategory);
  });

  it('should call updateCategory on store', () => {
    service.updateCategory(mockCategory);

    expect(categoryStore.updateCategory).toHaveBeenCalledWith(mockCategory);
  });

  it('should handle updateCategory error', () => {
    categoryStore.updateCategory.mockImplementation(() => {
      throw new Error('Update error');
    });

    expect(() => service.updateCategory(mockCategory)).toThrow('Update error');
    expect(categoryStore.updateCategory).toHaveBeenCalledWith(mockCategory);
  });

  it('should call deleteCategory on store', () => {
    service.deleteCategory(1);

    expect(categoryStore.deleteCategory).toHaveBeenCalledWith(1);
  });

  it('should handle deleteCategory error', () => {
    categoryStore.deleteCategory.mockImplementation(() => {
      throw new Error('Delete error');
    });

    expect(() => service.deleteCategory(1)).toThrow('Delete error');
    expect(categoryStore.deleteCategory).toHaveBeenCalledWith(1);
  });

  it('should call setPage on store', () => {
    service.setPage(2);

    expect(categoryStore.setPage).toHaveBeenCalledWith(2);
  });

  it('should call setPageSize on store', () => {
    service.setPageSize(20);

    expect(categoryStore.setPageSize).toHaveBeenCalledWith(20);
  });

  it('should call setSearchQuery on store', () => {
    service.setSearchQuery('test');

    expect(categoryStore.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should call sortCategories on store', () => {
    service.sortCategories('name', 'asc');

    expect(categoryStore.sortCategories).toHaveBeenCalledWith('name', 'asc');
  });
});