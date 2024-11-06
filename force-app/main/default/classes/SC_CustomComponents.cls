public with sharing class SC_CustomComponents {

    @AuraEnabled
    public static List<LookupRecordWrapper> fetchLookupRecords(String lookupName, String searchString, String filterValues) {
        String searchLike = '%' + searchString + '%';
        SC_Custom_Lookup_Property__mdt customLookupProperty = SC_Custom_Lookup_Property__mdt.getInstance(lookupName);
        if(customLookupProperty == null) {
            throw new AuraHandledException('Lookup Name is Incorrect (or) Lookup Name has not been added to the metadata');
        }
        String query = String.format('SELECT Id, {0} FROM {1} WHERE {0} LIKE :searchLike AND {0} != NULL ', new List<String>{customLookupProperty.Field__c, customLookupProperty.Object__c, searchLike });
        if(String.isNotBlank(customLookupProperty.Condition__c)) {
            query += 'AND (' + customLookupProperty.Condition__c + ') ';
        }
        query += 'LIMIT 10';
        List<sObject> recordList = new List<sObject>();
        try {
            recordList = Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error Occured while searching. Error : ' + e.getMessage());
        }
        List<LookupRecordWrapper> lookupRecordList = new List<LookupRecordWrapper>();
        for(sObject record: recordList) {
            LookupRecordWrapper lookupRecord = new LookupRecordWrapper();
            lookupRecord.value = (String)record.get('Id');
            lookupRecord.label = getLabel(record, customLookupProperty.Field__c);
            lookupRecordList.add(lookupRecord);
        }
        return lookupRecordList;
    }

    public static String getLabel(sObject record, String fieldName) {
        List<String> fieldList = fieldName.split('\\.');
        sObject childObject;
        if(fieldList.size() > 1) {
            childObject = record.getSObject(fieldList[0]);
            for(Integer i = 1; i < fieldList.size() - 1; i++) {
                childObject = record.getSObject(fieldList[i]);
            }
            return (String) childObject.get(fieldList[fieldList.size() - 1]);
        }
        return (String)record.get(fieldList[0]);
    }

   

    public class LookupRecordWrapper {
        @AuraEnabled public String value;
        @AuraEnabled public String label;
    }
}