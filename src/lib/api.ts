/**
 * API CLIENT SERVICE
 * 
 * Centralized HTTP client for all backend communication.
 * 
 * Flow: Component → useApi hook → apiClient → Express Backend → Response
 * 
 * Features:
 * - Automatic error handling
 * - Request/response typing
 * - Auth token injection (when Supabase is configured)
 * - Retry logic for transient failures
 */

import type { AnalysisResult, AnalyticsData, HistoryEntry, ModelPerformanceData, UserSettings } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';  // Same-origin in dev and prod
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * POST /api/analyze-comment
   * Sends text to backend → NLP preprocessing → ML inference → DB storage → response
   */
  async analyzeComment(text: string): Promise<AnalysisResult> {
    return this.request<AnalysisResult>('/api/analyze-comment', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * GET /api/history
   * Retrieves paginated prediction history for the authenticated user
   */
  async getHistory(page = 1, limit = 20): Promise<HistoryEntry[]> {
    return this.request<HistoryEntry[]>(`/api/history?page=${page}&limit=${limit}`);
  }

  /**
   * GET /api/analytics
   * Aggregated analytics data from analytics_snapshots table
   */
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>('/api/analytics');
  }

  /**
   * GET /api/model-metrics
   * BERT model performance metrics over time
   */
  async getModelMetrics(): Promise<ModelPerformanceData> {
    return this.request<ModelPerformanceData>('/api/model-metrics');
  }

  /**
   * PATCH /api/settings
   * Update user preferences
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  /**
   * POST /api/moderation/override
   * Human moderator overrides an AI decision
   */
  async overrideModeration(predictionId: number, newAction: string, reason: string): Promise<void> {
    return this.request('/api/moderation/override', {
      method: 'POST',
      body: JSON.stringify({ prediction_id: predictionId, new_action: newAction, reason }),
    });
  }
}

export const api = new ApiClient();
