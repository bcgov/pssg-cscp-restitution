import { Component, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { noop, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { LookupsService as ApiLookupsService } from '../../../api/lookups/lookups.service';
import { config } from '../../../config';
import { CityLookupDto, CitySearchResponseDto, CountryLookupDto, ProvinceLookupDto } from '../../../model';
import { LookupsStore } from '../../store/lookups/lookups.store';
import { COUNTRIES_ADDRESS } from '../address/country-list';
import { POSTAL_CODE, ZIP_CODE } from '../regex.constants';

@Component({
  selector: 'app-restitution-address',
  templateUrl: './address.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestitutionAddressComponent implements OnInit {
  countryList: CountryLookupDto[] = config.preferred_countries;
  preferred_countries: CountryLookupDto[] = config.preferred_countries;
  postalRegex = POSTAL_CODE;
  zipRegex = ZIP_CODE;

  provinceList: ProvinceLookupDto[];
  provinceType: string;
  postalCodeType: string;
  postalCodeSample: string;

  cityList: CityLookupDto[] = [];
  search: string;
  filteredProvinces$: Observable<ProvinceLookupDto[]>;
  citySuggestions$: Observable<CityLookupDto[]>;
  errorMessage: string;

  selectedCountry: CountryLookupDto;
  selectedProvince: ProvinceLookupDto;

  isProvinceDisabled: boolean = false;
  isCityDisabled: boolean = false;

  @Input() group = UntypedFormGroup;
  @Input() showChildrenAsRequired: boolean = true;
  @Input() isDisabled: boolean = false;
  lookupData: {
    countries: CountryLookupDto[];
    provinces: ProvinceLookupDto[];
    cities: CityLookupDto[];
  } = {
    countries: [],
    provinces: [],
    cities: []
  };
  private readonly lookupsStore = inject(LookupsStore);
  private readonly apiLookupsService = inject(ApiLookupsService);

  constructor() {
    let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;
  }

  ngOnInit() {
    //city search
    const cityControl = this.group['controls']['city'] as UntypedFormControl;
    this.citySuggestions$ = cityControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query) return of([]);

        let countryVal = this.group['controls']['country'].value?.toString() ?? '';
        let provinceVal = this.group['controls']['province'].value?.toString() ?? '';
        let searchVal = query;

        const normalizedCountryVal = countryVal.trim().toLowerCase();
        const normalizedProvinceVal = provinceVal.trim().toLowerCase();

        const countryFromControl = this.lookupData.countries.find(
          (country) => (country.name ?? '').toLowerCase() === normalizedCountryVal
        );
        const selectedCountryId = countryFromControl?.id ?? this.selectedCountry?.id;

        const provinceFromControl = this.lookupData.provinces.find((province) => {
          if ((province.name ?? '').toLowerCase() !== normalizedProvinceVal) {
            return false;
          }
          if (!selectedCountryId) {
            return true;
          }
          return province.countryId === selectedCountryId;
        });

        const selectedProvinceId = provinceFromControl?.id ?? this.selectedProvince?.id;

        return this.apiLookupsService
          .getApiLookupsCitiesSearch('application/json', {
            country: selectedCountryId,
            province: selectedProvinceId,
            searchVal,
            limit: 15
          })
          .pipe(
            map((data: CitySearchResponseDto) => {
              if (data && data.cityCollection) {
                const normalizedSearch = (searchVal ?? '').trim().toLowerCase();
                const cityCollection = [...data.cityCollection] as CityLookupDto[];
                cityCollection.sort((a, b) => {
                  const cityA = (a.name ?? '').toLowerCase();
                  const cityB = (b.name ?? '').toLowerCase();

                  const aStartsWithSearch = normalizedSearch ? cityA.startsWith(normalizedSearch) : false;
                  const bStartsWithSearch = normalizedSearch ? cityB.startsWith(normalizedSearch) : false;

                  if (aStartsWithSearch !== bStartsWithSearch) {
                    return aStartsWithSearch ? -1 : 1;
                  }

                  return (a.name ?? '').localeCompare(b.name ?? '');
                });
                return cityCollection;
              } else return [];
            }),
            tap(
              () => noop,
              (err) => {
                this.errorMessage = (err && err.message) || 'Something goes wrong';
              }
            )
          );
        return of([]);
      })
    );

    this.countryList = config.preferred_countries;
    this.provinceList = [];

    let promise_array = [];
    if (!this.lookupData.countries || this.lookupData.countries.length == 0) {
      promise_array.push(
        new Promise<void>(async (resolve) => {
          if (!this.lookupsStore.isCountriesLoaded()) {
            await this.lookupsStore.loadCountries();
          }

          this.lookupData.countries = [...this.lookupsStore.countries()];

          if (this.lookupData.countries) {
            this.lookupData.countries.sort(function (a, b) {
              return (a.name ?? '').localeCompare(b.name ?? '');
            });
          }

          resolve();
        })
      );
    }

    if (!this.lookupData.provinces || this.lookupData.provinces.length == 0) {
      promise_array.push(
        new Promise<void>(async (resolve) => {
          if (!this.lookupsStore.isProvincesLoaded()) {
            await this.lookupsStore.loadProvinces();
          }

          this.lookupData.provinces = [...this.lookupsStore.provinces()];

          if (this.lookupData.provinces) {
            this.lookupData.provinces.sort(function (a, b) {
              return (a.name ?? '').localeCompare(b.name ?? '');
            });
          }

          resolve();
        })
      );
    }

    Promise.all(promise_array).then((res) => {
      this.setupForm();
    });
  }

  setupForm() {
    if (this.showChildrenAsRequired === undefined) {
      this.showChildrenAsRequired = true;
    }

    let pref_countries = this.lookupData.countries.filter(
      (c) => config.preferred_countries.findIndex((pc) => pc.id == c.id) >= 0
    );
    let remaining_countries = this.lookupData.countries.filter(
      (c) => config.preferred_countries.findIndex((pc) => pc.id == c.id) < 0
    );

    pref_countries.sort(function (a, b) {
      return (
        config.preferred_countries.findIndex((c) => c.id == a.id) -
        config.preferred_countries.findIndex((c) => c.id == b.id)
      );
    });
    if (!this.alreadyHasOtherOption(pref_countries) && !this.alreadyHasOtherOption(remaining_countries))
      pref_countries.unshift(config.other_country);

    remaining_countries.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    this.countryList = pref_countries.concat(remaining_countries);
    this.cityList = [config.other_city];

    let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
    this.provinceType = canada.areaType;
    this.postalCodeType = canada.postalCodeName;
    this.postalCodeSample = canada.postalCodeSample;

    let countryVal = this.group['controls']['country'].value.toString();
    this.selectedCountry = this.lookupData.countries.filter(
      (c) => (c.name ?? '').toLowerCase() == countryVal.toLowerCase()
    )[0];
    if (countryVal === 'Other') this.selectedCountry = { name: 'Other', id: '123' };
    if (!this.selectedCountry) {
      this.selectedCountry = this.lookupData.countries.filter((p) => (p.name ?? '').toLowerCase() === 'canada')[0];
    }

    if (this.selectedCountry) {
      this.provinceList = this.lookupData.provinces.filter((p) => p.countryId === this.selectedCountry.id);
      this.provinceList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      let other_province_index = this.getOtherIndex(this.provinceList);
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      } else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }
    }

    if (this.selectedCountry) {
      this.setProvinceAndPostalType(this.selectedCountry.name ?? '');
    }

    let provinceVal = this.group['controls']['province'].value.toString();
    this.selectedProvince = this.lookupData.provinces.filter(
      (c) => (c.name ?? '').toLowerCase() == provinceVal.toLowerCase()
    )[0];
    if (this.selectedProvince && this.selectedProvince.name != 'British Columbia') this.updateCityList();
    else this.setCityValidators();
    this.setProvinceValidators();

    const provinceControl = this.group['controls']['province'] as UntypedFormControl;
    this.filteredProvinces$ = provinceControl.valueChanges.pipe(
      startWith(provinceControl.value ?? ''),
      map((value: string) => {
        const filter = (value ?? '').toLowerCase();
        return filter
          ? this.provinceList.filter((p) => (p.name ?? '').toLowerCase().includes(filter))
          : [...this.provinceList];
      })
    );
  }

  isSubFieldValid(field: string, disabled: boolean) {
    if (disabled === true) return true;
    let formField = this.group['controls'][field];
    if (formField == null) return true;

    return formField.valid || !formField.touched;
  }

  onCountryChange(event) {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    provinceControl.patchValue('');
    this.selectedProvince = { name: '', countryId: '', code: '', id: '' };
    let cityControl = this.group['controls']['city'] as UntypedFormControl;
    cityControl.patchValue('');

    let selection = event.target.value.toLowerCase();
    this.selectedCountry = this.lookupData.countries.filter((c) => (c.name ?? '').toLowerCase() == selection)[0];
    if (this.selectedCountry) {
      this.provinceList = this.lookupData.provinces.filter((p) => p.countryId === this.selectedCountry.id);
      if (this.provinceList) {
        this.provinceList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      }
      let other_province_index = this.getOtherIndex(this.provinceList);
      if (other_province_index < 0) {
        this.provinceList.unshift(config.other_province);
      } else {
        let other_province = this.provinceList.splice(other_province_index, 1)[0];
        this.provinceList.unshift(other_province);
      }

      provinceControl.patchValue('');
      this.setProvinceValidators();

      let postalControl = this.group['controls']['postalCode'] as UntypedFormControl;
      postalControl.patchValue('');

      this.setProvinceAndPostalType(this.selectedCountry.name ?? '');
      this.updateCityList();
    } else {
      this.provinceList = [config.other_province];
      this.setProvinceAndPostalType('');
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  onProvinceSelected(provinceName: string) {
    this.group['controls']['city'].patchValue('');
    this.selectedProvince = this.lookupData.provinces.find(
      (p) => (p.name ?? '').toLowerCase() === (provinceName ?? '').toLowerCase()
    );
    this.updateCityList();
  }

  onProvinceChange(event) {
    let cityControl = this.group['controls']['city'] as UntypedFormControl;
    cityControl.patchValue('');
    let selection = event.target.value.toLowerCase();
    this.selectedProvince = this.lookupData.provinces.filter((c) => (c.name ?? '').toLowerCase() == selection)[0];
    this.updateCityList();
  }

  updateCityList() {
    if (this.selectedProvince && this.selectedCountry && this.selectedCountry.id && this.selectedProvince.id) {
      this.apiLookupsService
        .getApiLookupsCountryCountryIdProvinceProvinceIdCities(
          this.selectedCountry.id,
          this.selectedProvince.id,
          'application/json'
        )
        .subscribe((city_res) => {
          if (city_res.value) {
            this.cityList = city_res.value as CityLookupDto[];
            if (this.cityList) {
              this.cityList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
            }
            let other_city_index = this.getOtherIndex(this.cityList);
            if (other_city_index < 0) {
              this.cityList.unshift(config.other_city);
            } else {
              let other_city = this.cityList.splice(other_city_index, 1)[0];
              this.cityList.unshift(other_city);
            }
          } else {
            this.cityList = [config.other_city];
          }
          this.setCityValidators();
        });
    } else if (this.provinceList.length == 1 && this.selectedCountry && this.selectedCountry.id) {
      this.apiLookupsService
        .getApiLookupsCountryCountryCities(this.selectedCountry.id, 'application/json')
        .subscribe((city_res) => {
          if (city_res.value) {
            this.cityList = city_res.value as CityLookupDto[];
            if (this.cityList) {
              this.cityList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
            }
            let other_city_index = this.getOtherIndex(this.cityList);
            if (other_city_index < 0) {
              this.cityList.unshift(config.other_city);
            } else {
              let other_city = this.cityList.splice(other_city_index, 1)[0];
              this.cityList.unshift(other_city);
            }
          } else {
            this.cityList = [config.other_city];
          }
          this.setCityValidators();
        });
    } else {
      this.cityList = [config.other_city];
      this.setCityValidators();
    }
  }

  setProvinceAndPostalType(country: string) {
    let postalControl = this.group['controls']['postalCode'] as UntypedFormControl;
    if (country.toLowerCase() === 'canada') {
      if (this.showChildrenAsRequired) {
        postalControl.setValidators([Validators.required, Validators.pattern(this.postalRegex)]);
      } else {
        postalControl.setValidators([Validators.pattern(this.postalRegex)]);
      }
      let canada = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'canada')[0];
      this.provinceType = canada.areaType;
      this.postalCodeType = canada.postalCodeName;
      this.postalCodeSample = canada.postalCodeSample;
    } else if (country.toLowerCase() === 'united states of america') {
      postalControl.setValidators([Validators.pattern(this.zipRegex)]);
      let usa = COUNTRIES_ADDRESS.filter((c) => c.name.toLowerCase() == 'united states of america')[0];
      this.provinceType = usa.areaType;
      this.postalCodeType = usa.postalCodeName;
      this.postalCodeSample = usa.postalCodeSample;
    } else {
      postalControl.clearValidators();
      this.provinceType = 'Province/State';
      this.postalCodeType = 'Postal/ZIP Code';
      this.postalCodeSample = '';
    }
    postalControl.updateValueAndValidity();
  }

  setProvinceValidators() {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    if (this.provinceList.length == 0) {
      provinceControl.setErrors(null);
      provinceControl.disable();
      this.isProvinceDisabled = true;
    } else {
      provinceControl.enable();
      this.isProvinceDisabled = false;
    }
  }

  setCityValidators() {
    let provinceControl = this.group['controls']['province'] as UntypedFormControl;
    let cityControl = this.group['controls']['city'] as UntypedFormControl;

    if ((provinceControl.valid && this.cityList.length == 0) || provinceControl.disabled) {
      cityControl.setErrors(null);
      cityControl.disable();
      this.isCityDisabled = true;
    } else {
      cityControl.enable();
      this.isCityDisabled = false;
    }
  }

  alreadyHasOtherOption(list: any) {
    return list.findIndex((o) => o.name == 'Other') >= 0;
  }

  getOtherIndex(list: any) {
    return list.findIndex((o) => o.name == 'Other');
  }
}
