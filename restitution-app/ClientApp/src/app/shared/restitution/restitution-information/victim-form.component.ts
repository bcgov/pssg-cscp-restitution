import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LookupsService as ApiLookupsService } from '../../../../api/lookups/lookups.service';
import { CreateVictimRestitutionCaseRequestDto, ParticipantDto, VictimApplicationDto } from '../../../../model';
import { iRestitutionApplication } from '../../../interfaces/restitution.interface';
import { CRMBoolean, ResitutionForm } from '../../enums-list';
import {
  RESTITUTION_INFORMATION_PROVIDERS,
  RestitutionInformationComponent
} from './restitution-information.component';

@Component({
  selector: 'app-victim-form',
  templateUrl: './victim-form.component.html',
  styleUrls: ['./restitution-information.component.scss'],
  providers: RESTITUTION_INFORMATION_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class VictimFormComponent extends RestitutionInformationComponent {
  override formType = ResitutionForm.Victim;

  constructor(
    controlContainer: ControlContainer,
    fb: UntypedFormBuilder,
    matDialog: MatDialog,
    apiLookupsService: ApiLookupsService
  ) {
    super(controlContainer, fb, matDialog, apiLookupsService);
  }
}

export class VictimRestitutionForm {
  static toCreateRequest(formData: iRestitutionApplication): CreateVictimRestitutionCaseRequestDto {
    const restitutionInfo = formData.RestitutionInformation;
    const hasDesignate = restitutionInfo.authorizeDesignate && restitutionInfo.designate.length > 0;

    const app: VictimApplicationDto = {
      firstName: restitutionInfo.firstName,
      middleName: restitutionInfo.middleName,
      lastName: restitutionInfo.lastName,
      otherFirstName: restitutionInfo.otherFirstName,
      otherLastName: restitutionInfo.otherLastName,
      gender: restitutionInfo.gender,
      birthDate: restitutionInfo.birthDate as any,
      indigenousStatus: restitutionInfo.indigenousStatus,
      signature: restitutionInfo.signature,
      primaryRaceEthnicity: restitutionInfo.primaryRaceEthnicity,
      primaryRaceEthnicityText: restitutionInfo.otherPrimaryRaceEthnicity,
      pronouns: restitutionInfo.pronouns,
      pronounsText: restitutionInfo.otherPronoun,
      genderIdentityText: restitutionInfo.otherGender,
      preferredMethodOfContact: restitutionInfo.contactInformation.preferredMethodOfContact,
      smsPreferred: null,
      primaryPhoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      primaryAddressLine1: restitutionInfo.contactInformation.mailingAddress.line1,
      primaryAddressLine2: restitutionInfo.contactInformation.mailingAddress.line2,
      primaryAddressLine3: restitutionInfo.contactInformation.attentionTo,
      primaryCity: restitutionInfo.contactInformation.mailingAddress.city,
      primaryProvince: restitutionInfo.contactInformation.mailingAddress.province,
      primaryPostalCode: restitutionInfo.contactInformation.mailingAddress.postalCode,
      primaryCountry: restitutionInfo.contactInformation.mailingAddress.country,
      voicemailOption: null,
      offenderCustodyLocation: ''
    } as VictimApplicationDto;

    if (!hasDesignate) {
      app.smsPreferred = restitutionInfo.contactInformation.smsPreferred;
      app.primaryPhoneNumber = restitutionInfo.contactInformation.phoneNumber;
      app.alternatePhoneNumber = restitutionInfo.contactInformation.alternatePhoneNumber;
      app.email = restitutionInfo.contactInformation.email;
      app.voicemailOption = restitutionInfo.contactInformation.leaveVoicemail;
    }

    this.applyDeclarationFields(app, restitutionInfo);
    this.applyOffenderNameFields(app, restitutionInfo);

    const courtInfoCollection = restitutionInfo.courtFiles
      .filter((file) => file && (file.fileNumber || file.location))
      .map((file) => ({
        courtFileNumber: file.fileNumber,
        courtLocation: file.location
      }));

    const providerCollection: ParticipantDto[] = [];

    if (hasDesignate) {
      const designate = restitutionInfo.designate[0];

      restitutionInfo.contactInformation.entityContacts.forEach((contact) => {
        const address = contact?.mailingAddress ?? restitutionInfo.contactInformation.mailingAddress;

        let restContactPreferenceForUpdates: number | undefined;
        if (restitutionInfo.contactInformation.preferredMethodOfContact === 1) {
          restContactPreferenceForUpdates = 100000000;
        } else if (restitutionInfo.contactInformation.preferredMethodOfContact === 4) {
          restContactPreferenceForUpdates = 100000001;
        } else if (restitutionInfo.contactInformation.preferredMethodOfContact === 2) {
          restContactPreferenceForUpdates = 100000002;
        }

        if (restitutionInfo.contactInformation.smsPreferred === CRMBoolean.True) {
          restContactPreferenceForUpdates = 100000003;
        }

        providerCollection.push({
          firstName: designate.firstName,
          lastName: designate.lastName,
          preferredName: designate.preferredName,
          relationship1: 'Designate',
          addressLine1: address?.line1,
          addressLine2: address?.line2,
          city: address?.city,
          province: address?.province,
          postalCode: address?.postalCode,
          country: address?.country,
          phoneNumber: restitutionInfo.contactInformation.phoneNumber,
          alternatePhoneNumber: restitutionInfo.contactInformation.alternatePhoneNumber,
          email: restitutionInfo.contactInformation.email,
          voicemailOptions: restitutionInfo.contactInformation.leaveVoicemail,
          preferredMethodOfContact: this.toParticipantMethodOfContact(
            restitutionInfo.contactInformation.preferredMethodOfContact
          ),
          ...(restContactPreferenceForUpdates !== undefined ? { restContactPreferenceForUpdates } : {}),
          isPrimaryEntityContact: contact?.isPrimaryContact,
          title: contact?.contactTitle
        });
      });
    }

    restitutionInfo.courtFiles.forEach((file) => {
      providerCollection.push({
        firstName: restitutionInfo.firstName,
        middleName: restitutionInfo.middleName,
        lastName: restitutionInfo.lastName,
        relationship1: 'Victim',
        relationship2: 'Other',
        relationship2Other: file.relationship
      });
    });

    if (
      restitutionInfo.vsw &&
      restitutionInfo.vsw[0] &&
      Object.values(restitutionInfo.vsw[0]).some((value) => !!value)
    ) {
      const vsw = restitutionInfo.vsw[0];
      providerCollection.push({
        firstName: vsw.firstName,
        lastName: vsw.lastName,
        programName: vsw.program,
        phoneNumber: vsw.phoneNumber,
        email: vsw.email,
        relationship1: 'Victim Service Worker'
      });
    }

    const documentCollection = restitutionInfo.documents.map((document) => ({
      filename: document.filename,
      subject: document.subject,
      body: document.body
    }));

    return {
      application: app,
      courtInfoCollection: courtInfoCollection.length > 0 ? courtInfoCollection : null,
      providerCollection: providerCollection.length > 0 ? providerCollection : null,
      documentCollection: documentCollection.length > 0 ? documentCollection : null
    };
  }

  private static applyDeclarationFields(
    app: VictimApplicationDto,
    restitutionInfo: iRestitutionApplication['RestitutionInformation']
  ): void {
    if (restitutionInfo.signatureName) {
      app.declarationFullName = restitutionInfo.signatureName;
    }

    if (restitutionInfo.signerTitle) {
      app.signingOfficerTitle = restitutionInfo.signerTitle;
    }

    if (restitutionInfo.signatureDate) {
      app.declarationDate = restitutionInfo.signatureDate as any;
    }
  }

  private static applyOffenderNameFields(
    app: VictimApplicationDto,
    restitutionInfo: iRestitutionApplication['RestitutionInformation']
  ): void {
    restitutionInfo.courtFiles.forEach((file) => {
      if (file && (file.firstName || file.middleName || file.lastName || file.relationship)) {
        app.offenderFirstName = file.firstName;
        app.offenderMiddleName = file.middleName;
        app.offenderLastName = file.lastName;
      }
    });
  }

  private static toParticipantMethodOfContact(input: number): number | null {
    if (input === 1) {
      return 100000000;
    }

    if (input === 4) {
      return 100000002;
    }

    if (input === 2) {
      return 100000001;
    }

    return null;
  }
}
