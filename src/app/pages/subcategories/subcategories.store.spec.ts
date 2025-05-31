import { TestBed } from '@angular/core/testing';
import { SubcategoryStore } from './subcategories.store';
import { Subcategory } from './subcategories';

describe('SubcategoryStore', () => {
  let store: InstanceType<typeof SubcategoryStore>;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [SubcategoryStore],
    });
    store = TestBed.inject(SubcategoryStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct initial state', () => {
    expect(store.subcategories()).toEqual([]);
    expect(store.initialized()).toBe(true);
    expect(store.error()).toBe(null);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(10);
    expect(store.searchQuery()).toBe('');
    expect(store.isLoading()).toBe(false);
    expect(store.sortField()).toBe(null);
    expect(store.sortDirection()).toBe('asc');
    expect(store.selectedCategoryId()).toBe(null);
  });

  it('should load subcategories from localStorage on init', () => {
    const mockSubcategories: Subcategory[] = [
      {
        id: 1,
        name: 'Subcat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
    ];
    localStorageMock['subcategories'] = JSON.stringify(mockSubcategories);

    // Trigger onInit
    store.loadSubcategories();

    expect(store.subcategories()).toEqual(mockSubcategories);
    expect(store.initialized()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should handle loadSubcategories error', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    expect(() => store.loadSubcategories()).toThrow('Storage error');
    expect(store.error()).toBe('Storage error');
    expect(store.isLoading()).toBe(false);
  });

  it('should add a new subcategory', () => {
    const newSubcategory: Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewSubcat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
      categoryId: 2,
      CategoryName: 'Cat2',
    };

    const result = store.addSubcategory(newSubcategory);

    expect(store.subcategories().length).toBe(1);
    expect(store.subcategories()[0]).toMatchObject({
      ...newSubcategory,
      id: expect.any(Number),
      createdAt: expect.any(String),
      modifiedAt: expect.any(String),
    });
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['subcategories'])).toHaveLength(1);
    expect(result).toMatchObject({
      ...newSubcategory,
      id: expect.any(Number),
      createdAt: expect.any(String),
      modifiedAt: expect.any(String),
    });
  });

  it('should handle addSubcategory error', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Add error');
    });

    const newSubcategory: Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewSubcat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
      categoryId: 2,
      CategoryName: 'Cat2',
    };

    expect(() => store.addSubcategory(newSubcategory)).toThrow('Add error');
    expect(store.error()).toBe('Add error');
    expect(store.isLoading()).toBe(false);
  });

  it('should update an existing subcategory', () => {
    const initialSubcategory: Subcategory = {
      id: 1,
      name: 'Subcat1',
      icon: 'icon1',
      imageUrl: 'url1',
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: 'Comment1',
      categoryId: 1,
      CategoryName: 'Cat1',
    };
    localStorageMock['subcategories'] = JSON.stringify([initialSubcategory]);
    store.loadSubcategories();

    const updatedSubcategory: Subcategory = {
      ...initialSubcategory,
      name: 'UpdatedSubcat',
      comments: 'Updated comment',
    };

    store.updateSubcategory(updatedSubcategory);

    expect(store.subcategories()[0]).toMatchObject({
      ...updatedSubcategory,
      modifiedAt: expect.any(String),
    });
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['subcategories'])[0].name).toBe('UpdatedSubcat');
  });

  it('should handle updateSubcategory error with undefined message', () => {
  // Mock localStorage to throw an error without a message
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw { message: undefined }; // Simulate error without message
  });

  const subcategory: Subcategory = {
    id: 1,
    name: 'Subcat1',
    icon: 'icon1',
    imageUrl: 'url1',
    createdAt: '2023-01-01T00:00:00Z',
    modifiedAt: '2023-01-01T00:00:00Z',
    comments: 'Comment1',
    categoryId: 1,
    CategoryName: 'Cat1',
  };

  // Load initial data
  localStorageMock['subcategories'] = JSON.stringify([subcategory]);
  store.loadSubcategories();

  // Act and assert
  expect(() => store.updateSubcategory(subcategory)).toThrow();
  expect(store.error()).toBe('Failed to update subcategory'); // Verify fallback error message
  expect(store.isLoading()).toBe(false);
});

it('should handle deleteSubcategory error with undefined message', () => {
  // Mock localStorage to throw an error without a message
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw { message: undefined }; // Simulate error without message
  });

  const subcategory: Subcategory = {
    id: 1,
    name: 'Subcat1',
    icon: 'icon1',
    imageUrl: 'url1',
    createdAt: '2023-01-01T00:00:00Z',
    modifiedAt: '2023-01-01T00:00:00Z',
    comments: 'Comment1',
    categoryId: 1,
    CategoryName: 'Cat1',
  };

  // Load initial data
  localStorageMock['subcategories'] = JSON.stringify([subcategory]);
  store.loadSubcategories();

  // Act and assert
  expect(() => store.deleteSubcategory(1)).toThrow();
  expect(store.error()).toBe('Failed to delete subcategory'); // Verify fallback error message
  expect(store.isLoading()).toBe(false);
});

  it('should delete a subcategory', () => {
    const subcategory: Subcategory = {
      id: 1,
      name: 'Subcat1',
      icon: 'icon1',
      imageUrl: 'url1',
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: 'Comment1',
      categoryId: 1,
      CategoryName: 'Cat1',
    };
    localStorageMock['subcategories'] = JSON.stringify([subcategory]);
    store.loadSubcategories();

    store.deleteSubcategory(1);

    expect(store.subcategories()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['subcategories'])).toEqual([]);
  });

  it('should handle deleteSubcategory error', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Delete error');
    });

    expect(() => store.deleteSubcategory(1));
    expect(store.error()).toBe(null);
    expect(store.isLoading()).toBe(false);
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

  it('should sort subcategories and reset current page', () => {
    store.sortSubcategories('name', 'desc');
    expect(store.sortField()).toBe('name');
    expect(store.sortDirection()).toBe('desc');
    expect(store.currentPage()).toBe(1);
  });

  it('should set selected category ID and reset current page', () => {
    store.setSelectedCategoryId(3);
    expect(store.selectedCategoryId()).toBe(3);
    expect(store.currentPage()).toBe(1);
  });

  it('should filter subcategories by search query', () => {
    const subcategories: Subcategory[] = [
      {
        id: 1,
        name: 'TestSubcat',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
      {
        id: 2,
        name: 'Other',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
        categoryId: 2,
        CategoryName: 'Cat2',
      },
    ];
    localStorageMock['subcategories'] = JSON.stringify(subcategories);
    store.loadSubcategories();

    store.setSearchQuery('test');

    expect(store.filteredSubcategories()).toHaveLength(1);
    expect(store.filteredSubcategories()[0].name).toBe('TestSubcat');
  });

  it('should filter subcategories by category ID', () => {
    const subcategories: Subcategory[] = [
      {
        id: 1,
        name: 'Subcat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
      {
        id: 2,
        name: 'Subcat2',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
        categoryId: 2,
        CategoryName: 'Cat2',
      },
    ];
    localStorageMock['subcategories'] = JSON.stringify(subcategories);
    store.loadSubcategories();

    store.setSelectedCategoryId(1);

    expect(store.filteredSubcategories()).toHaveLength(1);
    expect(store.filteredSubcategories()[0].categoryId).toBe(1);
  });

  it('should sort subcategories by name', () => {
    const subcategories: Subcategory[] = [
      {
        id: 1,
        name: 'BSubcat',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
      {
        id: 2,
        name: 'ASubcat',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
    ];
    localStorageMock['subcategories'] = JSON.stringify(subcategories);
    store.loadSubcategories();

    store.sortSubcategories('name', 'asc');

    expect(store.filteredSubcategories()[0].name).toBe('ASubcat');
    expect(store.filteredSubcategories()[1].name).toBe('BSubcat');
  });

  it('should sort subcategories by createdAt', () => {
    const subcategories: Subcategory[] = [
      {
        id: 1,
        name: 'Subcat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
      {
        id: 2,
        name: 'Subcat2',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
        categoryId: 1,
        CategoryName: 'Cat1',
      },
    ];
    localStorageMock['subcategories'] = JSON.stringify(subcategories);
    store.loadSubcategories();

    store.sortSubcategories('createdAt', 'asc');

    expect(store.filteredSubcategories()[0].id).toBe(2);
    expect(store.filteredSubcategories()[1].id).toBe(1);
  });

  it('should paginate subcategories', () => {
    const subcategories: Subcategory[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Subcat${i + 1}`,
      icon: `icon${i + 1}`,
      imageUrl: `url${i + 1}`,
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: `Comment${i + 1}`,
      categoryId: 1,
      CategoryName: 'Cat1',
    }));
    localStorageMock['subcategories'] = JSON.stringify(subcategories);
    store.loadSubcategories();

    store.setPageSize(5);
    store.setPage(2);

    expect(store.paginatedSubcategories()).toHaveLength(5);
    expect(store.paginatedSubcategories()[0].id).toBe(6);
    expect(store.totalPages()).toBe(3);
  });

  it('should return empty paginated subcategories when no data', () => {
    expect(store.paginatedSubcategories()).toEqual([]);
    expect(store.totalPages()).toBe(0);
  });
});