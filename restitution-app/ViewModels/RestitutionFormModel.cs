using System;
using Newtonsoft.Json;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class RestitutionFormModel
    {
        public RestitutionApplication Application { get; set; }
        public CourtInfo[] CourtInfoCollection { get; set; }
        public Participant[] ProviderCollection { get; set; }
        public DocumentCollection[] DocumentCollection { get; set; }
    }

    public class RestitutionApplication
    {
        public string fortunecookietype
        {
            get { return "Microsoft.Dynamics.CRM.vsd_application"; }
        }
        public int vsd_applicanttype { get; set; }
        public string vsd_applicantsfirstname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsmiddlename { get; set; }
        public string vsd_applicantslastname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_otherfirstname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_otherlastname { get; set; }
        public int? vsd_applicantsgendercode { get; set; }
        public DateTime? vsd_applicantsbirthdate { get; set; }
        public int? vsd_indigenous { get; set; }
        public int? vsd_applicantspreferredmethodofcontact { get; set; }
        public int? vsd_smspreferred { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsprimaryphonenumber { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsalternatephonenumber { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsemail { get; set; }
        public string vsd_applicantsprimaryaddressline1 { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsprimaryaddressline2 { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_applicantsprimaryaddressline3 { get; set; }
        public string vsd_applicantsprimarycity { get; set; }
        public string vsd_applicantsprimaryprovince { get; set; }
        public string vsd_applicantsprimarypostalcode { get; set; }
        public string vsd_applicantsprimarycountry { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_cvap_offenderfirstname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_cvap_offendermiddlename { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_cvap_offenderlastname { get; set; }
        public int? vsd_voicemailoption { get; set; }
        public string vsd_applicantssignature { get; set; }
        public string vsd_declarationfullname { get; set; }
        public string vsd_signingofficertitle { get; set; }
        public DateTime? vsd_declarationdate { get; set; }
        public string vsd_contacttitle { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_offendercustodylocation { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_genderidentitytext { get; set; }
        public int? vsd_primaryraceethnicity { get; set; }
        public string vsd_primaryraceethnicitytext { get; set; }
        public int? vsd_pronouns { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_pronountext { get; set; }
    }

    public class CourtInfo
    {
        public string fortunecookietype
        {
            get { return "Microsoft.Dynamics.CRM.vsd_applicationcourtinformation"; }
        }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_courtfilenumber { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_courtlocation { get; set; }
    }

    public class Participant
    {
        public string fortunecookietype
        {
            get { return "Microsoft.Dynamics.CRM.vsd_participant"; }
        }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_firstname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_middlename { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_lastname { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_preferredname { get; set; }
        public string vsd_companyname { get; set; }
        public string vsd_name { get; set; }
        public string vsd_addressline1 { get; set; }
        public string vsd_addressline2 { get; set; }
        public string vsd_addressline3 { get; set; }
        public string vsd_city { get; set; }
        public string vsd_province { get; set; }
        public string vsd_country { get; set; }
        public string vsd_postalcode { get; set; }
        public int? vsd_preferredmethodofcontact { get; set; }
        public int? vsd_restcontactpreferenceforupdates { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_phonenumber { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_alternatephonenumber { get; set; }
        public int? vsd_voicemailoptions { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_email { get; set; }
        public string vsd_rest_custodylocation { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_rest_programname { get; set; }
        public string vsd_relationship1 { get; set; }
        public string vsd_relationship2 { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? vsd_relationship2other { get; set; }
        public string vsd_title { get; set; }
        public string vsd_contacttitle { get; set; }
        public int? vsd_smspreferred { get; set; }
        public int? vsd_isprimaryentitycontact { get; set; }
    }

    public class DocumentCollection
    {
        public string fortunecookietype => "Microsoft.Dynamics.CRM.activitymimeattachment";
        public string filename { get; set; }
        public string body { get; set; }

        [JsonConverter(typeof(EmptyStringToNullConverter))]
        public string? subject { get; set; }
    }
}
