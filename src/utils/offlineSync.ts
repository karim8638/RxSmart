import { supabase } from '../lib/supabase';

interface PendingOperation {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

class OfflineSync {
  private pendingOperations: PendingOperation[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.loadPendingOperations();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadPendingOperations() {
    try {
      const stored = localStorage.getItem('pending_operations');
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }

  private savePendingOperations() {
    try {
      localStorage.setItem('pending_operations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }

  async addOperation(
    table: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any
  ): Promise<boolean> {
    if (this.isOnline) {
      // Try to execute immediately if online
      try {
        await this.executeOperation(table, operation, data);
        return true;
      } catch (error) {
        console.error('Error executing operation:', error);
        // Fall back to queuing if immediate execution fails
      }
    }

    // Queue operation for later sync
    const pendingOp: PendingOperation = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      timestamp: Date.now(),
    };

    this.pendingOperations.push(pendingOp);
    this.savePendingOperations();
    return false; // Indicates operation was queued, not executed
  }

  private async executeOperation(
    table: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any
  ) {
    switch (operation) {
      case 'INSERT':
        const { error: insertError } = await supabase
          .from(table)
          .insert(data);
        if (insertError) throw insertError;
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    const operationsToSync = [...this.pendingOperations];
    const successfulOperations: string[] = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeOperation(operation.table, operation.operation, operation.data);
        successfulOperations.push(operation.id);
      } catch (error) {
        console.error('Error syncing operation:', error);
        // Keep failed operations in queue for retry
      }
    }

    // Remove successful operations from queue
    this.pendingOperations = this.pendingOperations.filter(
      op => !successfulOperations.includes(op.id)
    );
    this.savePendingOperations();

    if (successfulOperations.length > 0) {
      console.log(`Successfully synced ${successfulOperations.length} operations`);
    }
  }

  getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  clearPendingOperations(): void {
    this.pendingOperations = [];
    this.savePendingOperations();
  }
}

export const offlineSync = new OfflineSync();