import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-gr',
  imports: [CommonModule, FormsModule],
  templateUrl: './gr.html',
  styleUrls: ['./gr.css']
})
export class GrComponent implements OnInit {

  grList: any[] = [];
  filteredList: any[] = [];
  loading = true;

  grSearch = '';
  poSearch = '';
  materialSearch = '';

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGR();
  }

  loadGR(): void {
    this.api.getGR().subscribe({
      next: (res: any) => {

        if (res && res.success && res.data) {
          this.grList = res.data;
          this.filteredList = res.data;
        } else {
          this.grList = [];
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
    this.filteredList = this.grList.filter(item => {

      const matchGR = item.Mblnr.includes(this.grSearch);
      const matchPO = item.Ebeln.includes(this.poSearch);
      const matchMat = item.Matnr
        ?.toLowerCase()
        .includes(this.materialSearch.toLowerCase());

      return matchGR && matchPO && matchMat;
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