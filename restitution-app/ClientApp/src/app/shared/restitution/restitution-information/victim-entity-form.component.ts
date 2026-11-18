import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LookupsService as ApiLookupsService } from '../../../../api/lookups/lookups.service';
import {
  CreateVictimEntityRestitutionCaseRequestDto,
  ParticipantDto,
  VictimEntityApplicationDto
} from '../../../../model';
import { iRestitutionApplication } from '../../../interfaces/restitution.interface';
import { CRMBoolean, ResitutionForm } from '../../enums-list';
import {
  RESTITUTION_INFORMATION_PROVIDERS,
  RestitutionInformationComponent
} from './restitution-information.component';

@Component({
  selector: 'app-victim-entity-form',
  templateUrl: './victim-entity-form.component.html',
  styleUrls: ['./restitution-information.component.scss'],
  providers: RESTITUTION_INFORMATION_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class VictimEntityFormComponent extends RestitutionInformationComponent {
  override formType = ResitutionForm.VictimEntity;

  constructor(
    controlContainer: ControlContainer,
    fb: UntypedFormBuilder,
    matDialog: MatDialog,
    apiLookupsService: ApiLookupsService
  ) {
    super(controlContainer, fb, matDialog, apiLookupsService);
  }
}

export class VictimEntityRestitutionForm {
  static toCreateRequest(formData: iRestitutionApplication): CreateVictimEntityRestitutionCaseRequestDto {
    const restitutionInfo = formData.RestitutionInformation;
    const hasDesignate = restitutionInfo.authorizeDesignate && restitutionInfo.designate.length > 0;

    const primaryContact =
      restitutionInfo.contactInformation.entityContacts.find((contact) => contact?.isPrimaryContact === 100000000) ||
      restitutionInfo.contactInformation.entityContacts[0];

    const app: VictimEntityApplicationDto = {
      entityName: restitutionInfo.lastName,
      middleName: restitutionInfo.middleName,
      otherFirstName: restitutionInfo.otherFirstName,
      otherLastName: restitutionInfo.otherLastName,
      gender: restitutionInfo.gender,
      indigenousStatus: restitutionInfo.indigenousStatus,
      signature: restitutionInfo.signature,
      primaryRaceEthnicity: restitutionInfo.primaryRaceEthnicity,
      primaryRaceEthnicityText: restitutionInfo.otherPrimaryRaceEthnicity,
      pronouns: restitutionInfo.pronouns,
      pronounsText: restitutionInfo.otherPronoun,
      genderIdentityText: restitutionInfo.otherGender,
      smsPreferred: 100000000,
      preferredMethodOfContact: primaryContact?.preferredMethodOfContact,
      primaryPhoneNumber: primaryContact?.phoneNumber,
      alternatePhoneNumber: primaryContact?.alternatePhoneNumber,
      email: primaryContact?.email,
      primaryAddressLine1: restitutionInfo.contactInformation.mailingAddress.line1,
      primaryAddressLine2: restitutionInfo.contactInformation.mailingAddress.line2,
      primaryAddressLine3: '',
      primaryCity: restitutionInfo.contactInformation.mailingAddress.city,
      primaryProvince: restitutionInfo.contactInformation.mailingAddress.province,
      primaryPostalCode: restitutionInfo.contactInformation.mailingAddress.postalCode,
      primaryCountry: restitutionInfo.contactInformation.mailingAddress.country,
      voicemailOption: null,
      contactTitle: '',
      offenderCustodyLocation: ''
    } as VictimEntityApplicationDto;

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
      const designatePrimaryContact =
        restitutionInfo.contactInformation.entityContacts.find((contact) => contact?.isPrimaryContact === 100000000) ||
        restitutionInfo.contactInformation.entityContacts[0];

      restitutionInfo.contactInformation.entityContacts.forEach((contact) => {
        const address = contact?.mailingAddress ?? restitutionInfo.contactInformation.mailingAddress;

        let restContactPreferenceForUpdates: number | undefined;
        if (designatePrimaryContact?.preferredMethodOfContact === 1) {
          restContactPreferenceForUpdates = 100000000;
        } else if (designatePrimaryContact?.preferredMethodOfContact === 4) {
          restContactPreferenceForUpdates = 100000001;
        } else if (designatePrimaryContact?.preferredMethodOfContact === 2) {
          restContactPreferenceForUpdates = 100000002;
        }

        if (designatePrimaryContact?.smsPreferred === CRMBoolean.True) {
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
          phoneNumber: contact?.phoneNumber,
          alternatePhoneNumber: contact?.alternatePhoneNumber,
          email: contact?.email,
          voicemailOptions: contact?.leaveVoicemail,
          preferredMethodOfContact: this.toParticipantMethodOfContact(contact?.preferredMethodOfContact),
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

    restitutionInfo.contactInformation.entityContacts.forEach((contact) => {
      if (contact && Object.values(contact).some((value) => !!value)) {
        providerCollection.push({
          firstName: contact.firstName,
          lastName: contact.lastName,
          relationship1: 'Representative',
          preferredMethodOfContact: this.toParticipantMethodOfContact(contact.preferredMethodOfContact),
          phoneNumber: contact.phoneNumber,
          alternatePhoneNumber: contact.alternatePhoneNumber,
          voicemailOptions: contact.leaveVoicemail,
          email: contact.email,
          isPrimaryEntityContact: contact.isPrimaryContact,
          contactTitle: contact.contactTitle,
          smsPreferred: contact.smsPreferred
        });
      }
    });

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
    app: VictimEntityApplicationDto,
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
    app: VictimEntityApplicationDto,
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
