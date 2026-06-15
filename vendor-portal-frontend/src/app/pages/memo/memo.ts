import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-memo',
  imports: [CommonModule, FormsModule],
  templateUrl: './memo.html',
  styleUrls: ['./memo.css']
})
export class MemoComponent implements OnInit {

  memoList: any[] = [];
  filteredList: any[] = [];
  loading = true;

  memoSearch = '';
  typeFilter = 'all';

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMemo();
  }

  loadMemo(): void {
    this.api.getMemo().subscribe({
      next: (res: any) => {

        if (res?.success && res.data) {
          this.memoList = res.data.map((item: any) => ({
            ...item,
            type: this.getType(item.Dmbtr)
          }));

          this.filteredList = this.memoList;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getType(amount: number): string {
    return Number(amount) < 0 ? 'Credit' : 'Debit';
  }

  applyFilter() {
    this.filteredList = this.memoList.filter(item => {
      const matchMemo = item.Belnr.includes(this.memoSearch);
      const matchType =
        this.typeFilter === 'all' || item.type === this.typeFilter;

      return matchMemo && matchType;
    });
  }

  formatDate(sapDate: string): string {
    if (!sapDate) return '';
    const timestamp = Number(sapDate.replace(/[^0-9]/g, ''));
    return new Date(timestamp).toLocaleDateString();
  }

  goBack(): void {
    this.location.back();
  }
}