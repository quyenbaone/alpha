interface AnalyticsEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
}

class AnalyticsService {
    private static instance: AnalyticsService;
    private queue: AnalyticsEvent[];
    private isProcessing: boolean;
    private batchSize: number;
    private flushInterval: number;

    private constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds

        // Start periodic flush
        setInterval(() => this.flush(), this.flushInterval);
    }

    static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    trackEvent(event: AnalyticsEvent): void {
        this.queue.push(event);

        // If queue is full, flush immediately
        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    private async flush(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const events = this.queue.splice(0, this.batchSize);

        try {
            await this.sendToAnalytics(events);
        } catch (error) {
            console.error('Failed to send analytics:', error);
            // Put events back in queue
            this.queue.unshift(...events);
        } finally {
            this.isProcessing = false;
        }
    }

    private async sendToAnalytics(events: AnalyticsEvent[]): Promise<void> {
        // Implement your analytics service here (e.g., Google Analytics, Mixpanel, etc.)
        // This is a placeholder implementation
        console.log('Sending analytics events:', events);

        // Example implementation with fetch
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events }),
            });
        } catch (error) {
            console.error('Failed to send analytics to server:', error);
            throw error;
        }
    }

    // Helper methods for common events
    trackPageView(path: string): void {
        this.trackEvent({
            category: 'Page',
            action: 'View',
            label: path,
        });
    }

    trackSearch(query: string): void {
        this.trackEvent({
            category: 'Search',
            action: 'Query',
            label: query,
        });
    }

    trackClick(element: string, page: string): void {
        this.trackEvent({
            category: 'Click',
            action: element,
            label: page,
        });
    }

    trackError(error: Error, context: string): void {
        this.trackEvent({
            category: 'Error',
            action: error.name,
            label: `${context}: ${error.message}`,
        });
    }

    trackConversion(value: number, label: string): void {
        this.trackEvent({
            category: 'Conversion',
            action: 'Complete',
            label,
            value,
        });
    }
}

export const analytics = AnalyticsService.getInstance(); 