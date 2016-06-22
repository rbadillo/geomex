module.exports = function (db, cb) {
    
    db.define('Clients', {
        ClientId : {type: 'serial', key: true},
        Name : String,
        Logo : String,
        IsActive : Number,
        IsGold : Number,
        ActiveOffers : Number,
        OfferClosestExpiration : Date
    },{
        id: ['ClientId']   // Primary Key
    });

    db.define('Locations', {
        LocationId : {type: 'serial', key: true},
        Name: String,
        ClientId : Number,
        IsActive : Number,
        IsPrivate: Number,
        Latitude : Number,
        Longitude : Number,
        Address : String,
        Country : String,
        State : String,
        City : String,
        ZipCode : String
    },{
        id: ['LocationId']  // Primary Key
    });

    db.define('Messages', {
        MessageId : {type: 'serial', key: true},
        Message : String,
        OfferId : Number,
        ClientId : Number,
        IsPrivate: Number,
        TimeCreated : Date
    },{
        id: ['MessageId']  // Primary Key
    });

    db.define('SentMessages', {
        Id : {type: 'serial', key: true},
        UserId : {type:'integer',unsigned: true, size:8},
        MessageId : Number,
        MessageRead : Number,
        TimeSent : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('Users', {
        UserId: {type:'integer',unsigned: true, size:8, key:true},
        DeviceToken : String,
        PhoneType : String,
        Timezone: String,
        FbName : String,
        FbLastName : String,
        FbAge : Number,
        FbBirthday : String,
        FbEmail : String,
        FbGender : String,
        FbSchool : String,
        FbWork : String,
        FbLink : String,
        FbPhoto : String,
        LastRegister : Date
    },{ 
        id: ['UserId']  // Primary Key
    });

    db.define('LocationEvents', {
        Id : {type: 'serial', key: true},
        UserId: {type:'integer',unsigned: true, size:8},
        ClientId: Number,
        LocationId : Number,
        LocationName: String,
        Event: String,
        Latitude: Number,
        Longitude: Number,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('Offers', {
        OfferId : {type: 'serial', key: true},
        ClientId: Number,
        Name: String,
        Title: String,
        Subtitle: String,
        Code: String,
        Instructions: String,
        Disclaimer: String,
        PublishedDate: Date,
        StartDate: Date,
        EndDate: Date,
        IsActive : Number,
        Priority: Number,
        ActualRedemption: Number,
        TotalRedemption: Number,
        MultiUse: Number,
        IsPrivate: Number,
        DynamicRedemptionMinutes: Number,
        PrimaryImage: String,
        SecondaryImage: String
    },{
        id: ['OfferId']   // Primary Key
    });

    db.define('UserPrivateOffers', {
        Id : {type: 'serial', key: true},
        ClientId: Number,
        UserId: {type:'integer',unsigned: true, size:8},
        OfferId: Number,
        StartDate: Date,
        EndDate: Date,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('OfferRedemption', {
        Id : {type: 'serial', key: true},
        ClientId: Number,
        UserId: {type:'integer',unsigned: true, size:8},
        OfferId: Number,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('OfferEvents', {
        Id : {type: 'serial', key: true},
        ClientId: Number,
        UserId: {type:'integer',unsigned: true, size:8},
        OfferId: Number,
        Event: String,
        Latitude: Number,
        Longitude: Number,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('AppEvents', {
        Id : {type: 'serial', key: true},
        UserId: {type:'integer',unsigned: true, size:8},
        ClientId: Number,
        Event: String,
        Latitude: Number,
        Longitude: Number,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });


    return cb();
};