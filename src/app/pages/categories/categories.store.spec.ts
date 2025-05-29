import { TestBed } from '@angular/core/testing';
import { CategoryStore } from './categories.store';
import { Category } from './category';

describe('CategoryStore', () => {
  let store: InstanceType<typeof CategoryStore>;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [CategoryStore],
    });
    store = TestBed.inject(CategoryStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct initial state', () => {
    expect(store.categories()).toEqual([]);
    expect(store.initialized()).toBe(true);
    expect(store.error()).toBe(null);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(10);
    expect(store.searchQuery()).toBe('');
    expect(store.isLoading()).toBe(false);
    expect(store.sortField()).toBe(null);
    expect(store.sortDirection()).toBe('asc');
  });

  it('should load categories from localStorage on init', () => {
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Cat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(mockCategories);

    // Trigger onInit
    store.loadCategories();

    expect(store.categories()).toEqual(mockCategories);
    expect(store.initialized()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should handle loadCategories error', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    expect(() => store.loadCategories()).toThrow('Storage error');
    expect(store.error()).toBe('Storage error');
    expect(store.isLoading()).toBe(false);
  });

  it('should handle loadCategories with empty localStorage', () => {
    store.loadCategories();

    expect(store.categories()).toEqual([]);
    expect(store.initialized()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should add a new category', () => {
    const newCategory: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewCat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
    };

    const result = store.addCategory(newCategory);

    expect(store.categories().length).toBe(1);
    expect(store.categories()[0]).toMatchObject({
      ...newCategory,
      id: expect.any(Number),
      createdAt: expect.any(String),
      modifiedAt: expect.any(String),
    });
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['categories'])).toHaveLength(1);
    expect(result).toMatchObject({
      ...newCategory,
      id: expect.any(Number),
      createdAt: expect.any(String),
      modifiedAt: expect.any(String),
    });
  });

  it('should handle addCategory error', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Add error');
    });

    const newCategory: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'NewCat',
      icon: 'new-icon',
      imageUrl: 'new-url',
      comments: 'New comment',
    };

    expect(() => store.addCategory(newCategory)).toThrow('Add error');
    expect(store.error()).toBe('Add error');
    expect(store.isLoading()).toBe(false);
  });

  it('should update an existing category', () => {
    const initialCategory: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'icon1',
      imageUrl: 'url1',
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: 'Comment1',
    };
    localStorageMock['categories'] = JSON.stringify([initialCategory]);
    store.loadCategories();

    const updatedCategory: Category = {
      ...initialCategory,
      name: 'UpdatedCat',
      comments: 'Updated comment',
    };

    store.updateCategory(updatedCategory);

    expect(store.categories()[0]).toMatchObject({
      ...updatedCategory,
      modifiedAt: expect.any(String),
    });
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['categories'])[0].name).toBe('UpdatedCat');
  });

//   it('should handle updateCategory error', () => {
//     jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
//       throw new Error('Update error');
//     });

//     const category: Category = {
//       id: 1,
//       name: 'Cat1',
//       icon: 'icon1',
//       imageUrl: 'url1',
//       createdAt: '2023-01-01T00:00:00Z',
//       modifiedAt: '2023-01-01T00:00:00Z',
//       comments: 'Comment1',
//     };

//     expect(store.error()).toBe('Update error');
//     expect(store.isLoading()).toBe(false);
//   });

  it('should handle updateCategory with no localStorage data', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'icon1',
      imageUrl: 'url1',
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: 'Comment1',
    };

    store.updateCategory(category);

    expect(store.categories()).toEqual([]);
    expect(store.isLoading()).toBe(true);
    expect(store.error()).toBe(null);
  });

  it('should delete a category', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'icon1',
      imageUrl: 'url1',
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: 'Comment1',
    };
    localStorageMock['categories'] = JSON.stringify([category]);
    store.loadCategories();

    store.deleteCategory(1);

    expect(store.categories()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(null);
    expect(JSON.parse(localStorageMock['categories'])).toEqual([]);
  });

//   it('should handle deleteCategory error', () => {
//     jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
//       throw new Error('Delete error');
//     });

//     expect(store.error()).toBe('Delete error');
//     expect(store.isLoading()).toBe(false);
//   });

  it('should handle deleteCategory with no localStorage data', () => {
    store.deleteCategory(1);

    expect(store.categories()).toEqual([]);
    expect(store.isLoading()).toBe(true);
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

  it('should sort categories and reset current page', () => {
    store.sortCategories('name', 'desc');
    expect(store.sortField()).toBe('name');
    expect(store.sortDirection()).toBe('desc');
    expect(store.currentPage()).toBe(1);
  });

  it('should filter categories by search query', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'TestCat',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
      },
      {
        id: 2,
        name: 'Other',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.setSearchQuery('test');

    expect(store.filteredCategories()).toHaveLength(1);
    expect(store.filteredCategories()[0].name).toBe('TestCat');
  });

  it('should sort categories by name', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'BCat',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
      },
      {
        id: 2,
        name: 'ACat',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.sortCategories('name', 'asc');

    expect(store.filteredCategories()[0].name).toBe('ACat');
    expect(store.filteredCategories()[1].name).toBe('BCat');
  });

  it('should sort categories by createdAt', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Cat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
      },
      {
        id: 2,
        name: 'Cat2',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.sortCategories('createdAt', 'asc');

    expect(store.filteredCategories()[0].id).toBe(2);
    expect(store.filteredCategories()[1].id).toBe(1);
  });

  it('should sort categories by modifiedAt in descending order', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Cat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment1',
      },
      {
        id: 2,
        name: 'Cat2',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment2',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.sortCategories('modifiedAt', 'desc');

    expect(store.filteredCategories()[0].id).toBe(1);
    expect(store.filteredCategories()[1].id).toBe(2);
  });

  it('should paginate categories', () => {
    const categories: Category[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Cat${i + 1}`,
      icon: `icon${i + 1}`,
      imageUrl: `url${i + 1}`,
      createdAt: '2023-01-01T00:00:00Z',
      modifiedAt: '2023-01-01T00:00:00Z',
      comments: `Comment${i + 1}`,
    }));
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.setPageSize(5);
    store.setPage(2);

    expect(store.paginatedCategories()).toHaveLength(5);
    expect(store.paginatedCategories()[0].id).toBe(6);
    expect(store.totalPages()).toBe(3);
  });

  it('should return empty paginated categories when no data', () => {
    expect(store.paginatedCategories()).toEqual([]);
    expect(store.totalPages()).toBe(0);
  });

  it('should filter categories by icon', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Cat1',
        icon: 'test-icon',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Comment1',
      },
      {
        id: 2,
        name: 'Cat2',
        icon: 'other-icon',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Comment2',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.setSearchQuery('test');

    expect(store.filteredCategories()).toHaveLength(1);
    expect(store.filteredCategories()[0].icon).toBe('test-icon');
  });

  it('should filter categories by comments', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Cat1',
        icon: 'icon1',
        imageUrl: 'url1',
        createdAt: '2023-01-01T00:00:00Z',
        modifiedAt: '2023-01-01T00:00:00Z',
        comments: 'Test comment',
      },
      {
        id: 2,
        name: 'Cat2',
        icon: 'icon2',
        imageUrl: 'url2',
        createdAt: '2023-01-02T00:00:00Z',
        modifiedAt: '2023-01-02T00:00:00Z',
        comments: 'Other comment',
      },
    ];
    localStorageMock['categories'] = JSON.stringify(categories);
    store.loadCategories();

    store.setSearchQuery('test');

    expect(store.filteredCategories()).toHaveLength(1);
    expect(store.filteredCategories()[0].comments).toBe('Test comment');
  });
});