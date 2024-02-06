import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DbConnectionService } from 'src/app/services/db-connection.service';
import { ImageService } from 'src/app/services/image.service';
import { UserService } from 'src/app/services/user.service';
import { ListingModule } from '../listing.module';
import { CompanyService } from 'src/app/services/company.service';
import { PropertiesService } from 'src/app/services/properties.service';

@Component({
  selector: 'app-form',
  templateUrl: './createeditlisting.component.html',
  styleUrls: ['./createeditlisting.component.scss']
})
export class CreateEditListingComponent implements OnInit {

  fileName: string;
  imgSrc: string;
  imgError: string;

  form: UntypedFormGroup;
  error: string
  listingId: number = -1;
  categories = [];
  properties = {};

  constructor(private user: UserService,
    private route: ActivatedRoute,
    private db: DbConnectionService,
    private router: Router,
    private image: ImageService,
    private companyService: CompanyService,
    public ps: PropertiesService) {
    // redirect to login page when not logged in
    if (!this.user.isLoggedIn())
        this.router.navigateByUrl("/login")
    // initialize form fields
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(),
      description: new UntypedFormControl(),
      availableAssets: new UntypedFormControl(),
      date: new UntypedFormControl(),
      price: new UntypedFormControl(),
      location: new UntypedFormControl(),
      link: new UntypedFormControl(),
    })
   }

  ngOnInit(): void {

    // get url query params
    this.route.queryParamMap.subscribe(qMap => {
      // when query has 'edit' parameter, edit listing data
      let lId = qMap['params'].edit;
      if (lId){
        this.db.getListing(lId).then(l => {
          // update listingID
          this.listingId = l['listingID']
          // fill out form with listingdata
          this.form.patchValue({
            name: l['name'],
            description: l['description'],
            availableAssets: l['availableAssets'],
            date: l['date'],
            price: l['price'],
            location: l['location'],
          })
          if (l['picture']){
            this.imgSrc = l['picture']
            this.imgError = ""
          }

          this.getCategories(l['categories']);
        })
      } else
        this.getCategories();

    })
  }

  // get categories
  getCategories(selected=[]){
    this.db.getCategories().then(r => {
      this.categories = Object.entries(r).map(([k, v]) => [k, v.map((x => {
        return {name: x, selected: selected.includes(x)}
      }))])
    })
  }

  // select file
  fileSelected(ev){
    // no files selected
    if (ev.target.files.length === 0)
      return;
    // reset variables
    this.imgError = undefined;
    this.imgSrc = undefined;
    let f: File = <File>ev.target.files[0];
    this.fileName = f.name;
    // convert image to standard format
    this.image.convertFileToJpegBase64(f, (c) => {
      this.imgSrc = c;
    }, (err) => {
      this.imgError = err;
    }, 572, 360)
  }

  // onSubmit function
  createListing(){
    // get values
    let values = {...this.form.getRawValue(), };
    // add selected categories
    values['categories'] = this.categories.map(x => x[1]).reduce((acc, val) => acc.concat(val), []).filter(x => x.selected).map(x => x.name)
    // add image
    values['picture'] = this.imgSrc;
    // add file
    values['file'] = this.imgSrc
    // create listing
    if (this.listingId < 0)
      this.db.createListing(this.user.getLoginToken(), values, this.companyService.companyName).then(r => {
        // go to details page
        this.router.navigateByUrl(`/listings/details/${r['listingID']}`)
      }).catch(err => this.error = err.error.message)
    else // update listing
      this.db.postListing(this.listingId, this.user.getLoginToken(), values).then(r => {
        // go to details page
        this.router.navigateByUrl(`/listings/details/${this.listingId}`)
      }).catch(err => this.error = err.error.message)
  }
}
