import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payslip.html',
  styleUrl: './payslip.css'
})

export class Payslip implements OnInit {

  payslipData: any = null;

  payslipHistory: any[] = [];

  filteredPayslips: any[] = [];

  selectedMonth = '';

  selectedYear = '';

  loading = false;

  errorMessage = '';

  pdfUrl!: SafeResourceUrl;

  employeeId =
    localStorage.getItem('employeeId') || '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    if (!this.employeeId) {

      this.router.navigate(['/login']);

      return;

    }

    const now = new Date();

    this.selectedMonth =
      String(now.getMonth() + 1)
      .padStart(2, '0');

    this.selectedYear =
      String(now.getFullYear());

    this.getPayslip();

    this.getPayslipHistory();

    this.loadPdfPreview();

  }

  getPayslip(): void {

    this.loading = true;

    this.http.get(
      `http://localhost:3000/payslipheader/${this.employeeId}`
    ).subscribe({

      next: (res: any) => {

        this.loading = false;

        this.payslipData = res.d;

      },

      error: () => {

        this.loading = false;

        this.errorMessage =
          'Unable to load payslip';

      }

    });

  }

  getPayslipHistory(): void {

    this.http.get(
      `http://localhost:3000/paysliphistory/${this.employeeId}`
    ).subscribe({

      next: (res: any) => {

        this.payslipHistory =
          res?.d?.results || [];

        this.filteredPayslips =
          [...this.payslipHistory];

      }

    });

  }

  getPdfUrl(
    month = this.selectedMonth,
    year = this.selectedYear
  ): string {

    return `http://localhost:3000/payslippdf/${this.employeeId}/${month}/${year}`;

  }

  loadSelectedPayslip(): void {

    this.loadPdfPreview();

  }

  loadPdfPreview(): void {

    this.pdfUrl =
      this.sanitizer
      .bypassSecurityTrustResourceUrl(
        this.getPdfUrl()
      );

  }

  selectHistoryPayslip(item: any): void {

    this.selectedMonth =
      item.PayMonth;

    this.selectedYear =
      item.PayYear;

    this.loadPdfPreview();

  }

  filterPayslips(): void {

    this.filteredPayslips =
      this.payslipHistory.filter(
        item => {

          const month =
            !this.selectedMonth ||
            item.PayMonth === this.selectedMonth;

          const year =
            !this.selectedYear ||
            item.PayYear === this.selectedYear;

          return month && year;

        }
      );

  }

  goBack(): void {

    this.router.navigate(['/dashboard']);

  }

  viewPdf(item?: any): void {

    window.open(
      this.getPdfUrl(
        item?.PayMonth,
        item?.PayYear
      ),
      '_blank'
    );

  }

  downloadPdf(item?: any): void {

    this.http.get(
      this.getPdfUrl(
        item?.PayMonth,
        item?.PayYear
      ),
      {
        responseType: 'blob'
      }
    ).subscribe((blob: Blob) => {

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `Payslip_${item?.PayMonth || this.selectedMonth}_${item?.PayYear || this.selectedYear}.pdf`;

      link.click();

      URL.revokeObjectURL(url);

    });

  }

  printPayslip(item?: any): void {

    this.http.get(
      this.getPdfUrl(
        item?.PayMonth,
        item?.PayYear
      ),
      {
        responseType: 'blob'
      }
    ).subscribe({

      next: (blob: Blob) => {

        const blobUrl =
          URL.createObjectURL(blob);

        const printWindow =
          window.open('', '_blank');

        if (!printWindow) {

          alert(
            'Please allow popups'
          );

          return;

        }

        printWindow.document.write(`
          <html>

            <body style="margin:0">

              <iframe
                id="pdfFrame"
                src="${blobUrl}"
                style="
                  border:none;
                  width:100%;
                  height:100vh;
                "
              ></iframe>

              <script>

                const iframe =
                  document.getElementById(
                    'pdfFrame'
                  );

                iframe.onload = () => {

                  setTimeout(() => {

                    iframe.contentWindow.focus();

                    iframe.contentWindow.print();

                  }, 1000);

                };

              <\/script>

            </body>

          </html>
        `);

        printWindow.document.close();

      },

      error: () => {

        alert(
          'Unable to print payslip'
        );

      }

    });

  }

  mailPayslip(item?: any): void {

  const month =
    item?.PayMonth || this.selectedMonth;

  const year =
    item?.PayYear || this.selectedYear;

  const fileName =
    `Payslip_${this.employeeId}_${month}_${year}.pdf`;

  const subject =
    `Payslip ${month}/${year}`;

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(
      'Please find my payslip attached.'
    )}`;

  this.http.get(
    this.getPdfUrl(month, year),
    {
      responseType: 'blob'
    }
  ).subscribe({

    next: (blob: Blob) => {

      const pdfFile =
        new File(
          [blob],
          fileName,
          {
            type: 'application/pdf'
          }
        );

      if (
        navigator.canShare &&
        navigator.canShare({
          files: [pdfFile]
        })
      ) {

        navigator.share({

          files: [pdfFile],

          title: subject,

          text:
            'Please find my payslip attached.'

        }).catch(() => {});

        return;

      }

      const blobUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href =
        blobUrl;

      link.download =
        fileName;

      link.click();

      URL.revokeObjectURL(
        blobUrl
      );

      setTimeout(() => {

        window.open(
          gmailUrl,
          '_blank'
        );

      }, 500);

    },

    error: () => {

      alert(
        'Unable to fetch PDF. Opening Gmail — please attach manually.'
      );

      window.open(
        gmailUrl,
        '_blank'
      );

    }

  });

}

}