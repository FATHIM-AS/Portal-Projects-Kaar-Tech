import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-rfq',
  imports: [CommonModule, FormsModule],
  templateUrl: './rfq.html',
  styleUrls: ['./rfq.css']
})
export class RfqComponent implements OnInit {

  rfqList: any[] = [];
  filteredList: any[] = [];
  loading = true;

  rfqSearch = '';
  materialSearch = '';
  statusFilter = 'all';

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRFQ();
  }

  loadRFQ(): void {
    this.api.getRFQ().subscribe({
      next: (res: any) => {

        if (res && res.success && res.data) {
          this.rfqList = res.data;
          this.filteredList = res.data;
        } else {
          this.rfqList = [];
          this.filteredList = [];
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

  applyFilter() {
    this.filteredList = this.rfqList.filter(item => {

      const matchRFQ = item.Anfnr.includes(this.rfqSearch);

      const matchMaterial = item.Matnr
        ?.toLowerCase()
        .includes(this.materialSearch.toLowerCase());

      let matchStatus = true;

      if (this.statusFilter === 'open') {
        matchStatus = item.Status === 'Open';
      } else if (this.statusFilter === 'closed') {
        matchStatus = item.Status === 'Closed';
      }

      return matchRFQ && matchMaterial && matchStatus;
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