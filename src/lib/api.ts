import type { AnalysisResult, AnalyticsData, HistoryEntry, ModelPerformanceData, UserSettings, ExecutiveDashboard } from '../types';

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
   * POST /api/analyze-feedback
   * Sends text to backend → NLP preprocessing → ML inference → DB storage → response
   */
  async analyzeFeedback(text: string): Promise<AnalysisResult> {
    return this.request<AnalysisResult>('/api/analyze-feedback', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * GET /api/history
   * Retrieves paginated analysis history for the authenticated user
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
   * GET /api/executive-dashboard
   * High-level KPIs and trending topics
   */
  async getExecutiveDashboard(): Promise<ExecutiveDashboard> {
    return this.request<ExecutiveDashboard>('/api/executive-dashboard');
  }

  /**
   * GET /api/model-metrics
   * BERT sentiment model performance metrics over time
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
   * POST /api/feedback/correct
   * Human analyst overrides an AI sentiment decision
   */
  async correctFeedback(analysisId: number, correctedSentiment: string, reason: string): Promise<void> {
    return this.request('/api/feedback/correct', {
      method: 'POST',
      body: JSON.stringify({ analysis_id: analysisId, corrected_sentiment: correctedSentiment, reason }),
    });
  }
}

export const api = new ApiClient();
