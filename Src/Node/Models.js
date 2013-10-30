module.exports = function (db, cb) {
    
    db.define('Clients', {
        Name : String
    },{
        id: ['ClientId']   // Primary Key
    });

    db.define('Locations', {
        Name: String,
        ClientId : Number,
        Latitude : Number,
        Longitude : Number,
        Address : String,
        Country : String,
        State : String,
        City : String,
        ZipCode : String,
    },{
        id: ['LocationId']  // Primary Key
    });

    db.define('Messages', {
        Message : String,
        LocationId : Number,
        ClientId : Number,
        TimeCreated : Date
    },{
        id: ['MessageId']  // Primary Key
    });

    db.define('SentMessages', {
        UserId : Number,
        MessageId : Number,
        TimeSent : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('Users', {
        UserId : String,
        DeviceToken : String,
        PhoneType : String,
        LocationId : Number,
        Event : String,
        FbName : String,
        FbLastName : String,
        FbAge : Number,
        FbBirthday : String,
        FbEmail : String,
        FbGender : String,
        FbSchool : String,
        FbWork : String,
        FbLink : String,
    },{ 
        id: ['UserId']  // Primary Key
    });

    db.define('LocationEvents', {
        UserId : Number,
        ClientId: Number,
        LocationId : Number,
        LocationName: String,
        Event: String,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('Offers', {
        ClientId: Number,
        Name: String,
        Title: String,
        Subtitle: String,
        PublishedDate: Date,
        StartDate: Date,
        EndDate: Date,
        ActualRedemption: Number,
        TotalRedemption: Number,
        MultiUse: Number,
        Visibility: String
    },{
        id: ['OfferId']   // Primary Key
    });

    db.define('UserPrivateOffers', {
        ClientId: Number,
        UserId: Number,
        OfferId: Number,
        StartDate: Date,
        EndDate: Date,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });

    db.define('OfferRedemption', {
        ClientId: Number,
        UserId: Number,
        OfferId: Number,
        TimeCreated : Date
    },{
        id: ['Id']   // Primary Key
    });


    return cb();
};