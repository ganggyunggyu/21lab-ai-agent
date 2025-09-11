import { 
  getFavoriteSearches, 
  updatePublishedMemo, 
  updatePublishedExposure, 
  updatePublishedBlogId,
  updatePublishedActive,
  removeFavoriteSearch 
} from '@/utils/_localStorage';
import type { FavoriteSearch } from '../model/types';

export class PublishedApi {
  static getAll(): FavoriteSearch[] {
    const allFavorites = getFavoriteSearches();
    return allFavorites.filter((item) => item.isPublished);
  }

  static updateMemo(id: string, memo: string): void {
    updatePublishedMemo(id, memo);
  }

  static updateExposure(id: string, isVisible: boolean, exposureRank?: number): void {
    updatePublishedExposure(id, isVisible, exposureRank);
  }

  static updateBlogId(id: string, blogId: string): void {
    updatePublishedBlogId(id, blogId);
  }

  static updateActive(id: string, isActive: boolean): void {
    updatePublishedActive(id, isActive);
  }

  static delete(id: string): void {
    removeFavoriteSearch(id);
  }
}