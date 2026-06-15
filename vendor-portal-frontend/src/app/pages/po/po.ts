import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-po',
  imports: [CommonModule, FormsModule],
  templateUrl: './po.html',
  styleUrls: ['./po.css']
})
export class PoComponent implements OnInit {

  poList: any[] = [];
  filteredList: any[] = [];
  loading = true;

  poSearch = '';
  materialSearch = '';
  statusFilter = 'all';

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPO();
  }

  loadPO() {
    this.api.getPO().subscribe({
      next: (res: any) => {

        if (res && res.success && res.data) {
          this.poList = res.data;
          this.filteredList = res.data;
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
    this.filteredList = this.poList.filter(item => {

      const matchPO = item.Ebeln.includes(this.poSearch);
      const matchMat = item.Matnr?.toLowerCase().includes(this.materialSearch.toLowerCase());

      let matchStatus = true;
      if (this.statusFilter === 'delivered') {
        matchStatus = item.Elikz === true;
      } else if (this.statusFilter === 'pending') {
        matchStatus = item.Elikz === false;
      }

      return matchPO && matchMat && matchStatus;
    });
  }

  formatDate(sapDate: string): string {
    if (!sapDate) return '';
    const timestamp = Number(sapDate.replace(/[^0-9]/g, ''));
    return new Date(timestamp).toLocaleDateString();
  }

  getStatus(flag: boolean): string {
    return flag ? 'Delivered' : 'Pending';
  }

  goBack() {
    this.location.back();
  }
}