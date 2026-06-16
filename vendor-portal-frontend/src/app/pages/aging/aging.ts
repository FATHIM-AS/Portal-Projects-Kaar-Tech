import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-aging',
  imports: [CommonModule],
  templateUrl: './aging.html',
  styleUrls: ['./aging.css']
})
export class AgingComponent implements OnInit {

  agingList: any[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAging();
  }

  loadAging(): void {
    this.api.getAging().subscribe({
      next: (res: any) => {

        if (res && res.success && res.data) {
          this.agingList = res.data.map((item: any) => ({
            ...item,
            bucket: this.getBucket(item.AgingDays)
          }));
        } else {
          this.agingList = [];
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

  getBucket(days: number): string {
    if (days <= 30) return 'Current';
    if (days <= 60) return '30 Days';
    if (days <= 90) return '60 Days';
    return 'Overdue';
  }

  getTotal(): number {
    return this.agingList.reduce((sum, item) => {
      return sum + Number(item.Dmbtr || 0);
    }, 0);
  }
  getBucketClass(bucket: string): string {
  if (bucket === 'Current') return 'current';
  if (bucket === '30 Days') return 'days-30';
  if (bucket === '60 Days') return 'days-60';
  return 'overdue';
}

  goBack(): void {
    this.location.back();
  }
}