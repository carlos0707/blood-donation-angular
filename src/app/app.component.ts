import { Injectable,Component, AfterViewInit, ViewChild} from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { merge, Observable, of as observableOf, pipe } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';


import { MatSelectChange } from '@angular/material/select';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

@Injectable()
export class AppComponent {

  constructor(private httpClient: HttpClient) { }

  title = 'blood-donation-angular';

  public formData = new FormData();
  ReqJson: any = {};

  extractData   :any = [];
  dataBloodType :any = {};

  uploadFiles( e : any ) {

    let file: any = e.target.files; 

    for ( let i = 0; i < file.length; i++ ) {
        this.formData.append( "file", file[i], file[i]['name'] );
    }
  }

  RequestUpload() {
    
    this.formData.append( 'Info', JSON.stringify( this.ReqJson ) )
    
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ryPOuUBOA4gFMZxWbT8VS07DCgO52RvYOLNFYUe3v1g");

    this.httpClient.post<any>( 'http://localhost:8080/blood-donation/extraction-data', this.formData, {headers} )
        .subscribe(( resp ) => {     
          if(resp.success) {
            this.extractData = resp.result;
            this.extractData.forEach((s:any) => {
              console.log(s.averageByBloodType);
              this.dataBloodType = {
                aMais: s.averageByBloodType.aMais,
                aMenos: s.averageByBloodType.aMenos,
                bMais: s.averageByBloodType.bMais,
                bMenos: s.averageByBloodType.bMenos,
                abMais: s.averageByBloodType.abMais,
                abMenos: s.averageByBloodType.abMais,
                oMais: s.averageByBloodType.oMais,
                oMenos: s.averageByBloodType.oMenos,
                totalDonorsaMais: s.totalDonorsByBloodType.aMais,
                totalDonorsaMenos: s.totalDonorsByBloodType.aMenos,
                totalDonorsbMais: s.totalDonorsByBloodType.bMais,
                totalDonorsbMenos: s.totalDonorsByBloodType.bMenos,
                totalDonorsabMais: s.totalDonorsByBloodType.abMais,
                totalDonorsabMenos: s.totalDonorsByBloodType.abMenos,
                totalDonorsoMais: s.totalDonorsByBloodType.oMais,
                totalDonorsoMenos: s.totalDonorsByBloodType.oMenos,
                percentObesityMasc: s.percentObesity.percenteMasc,
                percentObesityFem: s.percentObesity.percenteFem,
                imcBetweenZeroAndTen: s.imcAgeGroup.zeroandten,
                imcBetweenElevenAndTwenty: s.imcAgeGroup.elevenandtwenty,
                imcBetweenTwentyoneAndThirty: s.imcAgeGroup.twentyoneandthirty,
                imcOverThirty: s.imcAgeGroup.overthirty,
                ac: s.candidatesByState.AC, al: s.candidatesByState.AL, ap: s.candidatesByState.AP, 
                am: s.candidatesByState.AM, ba: s.candidatesByState.BA, ce: s.candidatesByState.CE,
                es: s.candidatesByState.ES, go: s.candidatesByState.GO, ma: s.candidatesByState.MA,
                mt: s.candidatesByState.MT, ms: s.candidatesByState.MS, mg: s.candidatesByState.MG,
                pa: s.candidatesByState.PA, pb: s.candidatesByState.PB, pr: s.candidatesByState.PR,
                pe: s.candidatesByState.PE, pi: s.candidatesByState.PI, rj: s.candidatesByState.RJ,
                rn: s.candidatesByState.RN, rs: s.candidatesByState.RS, ro: s.candidatesByState.RO,
                rr: s.candidatesByState.RR, sc: s.candidatesByState.SC, sp: s.candidatesByState.SP,
                se: s.candidatesByState.SE, to: s.candidatesByState.TO, df: s.candidatesByState.DF 
              }
            });
          } 
        });     
  }

  getDonors(pageNumber: Number,
    pageSize: Number): Observable<DonorTable> {

    let headers = new HttpHeaders();
    headers = headers.set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ryPOuUBOA4gFMZxWbT8VS07DCgO52RvYOLNFYUe3v1g");
    
    return this.httpClient.get<DonorTable>('http://localhost:8080/blood-donation/all-donors?page='+pageNumber+'&size='+pageSize, {headers: headers});
  
  }

  displayedColumns: string[] = [
    'name',
    'cpf',
    'rg',
    'typeBlood'
  ];

  donTable: DonorTable;

  totalData: number;
  DonData: Donor[];

  dataSource = new MatTableDataSource<Donor>();

  isLoading = false;

  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [5, 10, 15];

  getTableData$(pageNumber: Number, pageSize: Number) {
    console.log(this.getDonors(pageNumber, pageSize));
    return this.getDonors(pageNumber, pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.getTableData$(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((donData) => {
          if (donData == null) return [];
          this.totalData = donData.total;
          this.isLoading = false;
          return donData.result;
        })
      )
      .subscribe((donData) => {
        this.DonData = donData;
        this.dataSource = new MatTableDataSource(this.DonData);
      });
  }

}

export interface Donor {
  name: string;
  cpf: string;
  rg: string;
  typeBlood: string;
}

export interface DonorTable {
  result: Donor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

