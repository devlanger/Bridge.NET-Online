using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BridgeNETServer
{
    public class MongoCRUD
    {
        private IMongoDatabase database;

        public MongoCRUD(string db)
        {
            var client = new MongoClient();
            database = client.GetDatabase("bridge-mmo");
        }

        public void InsertRecord<T>(string table, T record)
        {
            var col = database.GetCollection<T>(table);
            col.InsertOne(record);
        }

        public List<T> GetRecords<T>(string table)
        {
            var col = database.GetCollection<T>(table);
            return col.Find(new BsonDocument()).ToList();
        }

        public T GetRecordsById<T>(string table, int id)
        {
            var col = database.GetCollection<T>(table);
            var filter = Builders<T>.Filter.Eq("id", id);

            return col.Find(filter).First();
        }
    }

    public class DatabaseManager
    {
        protected static IMongoClient _client;
        protected static IMongoDatabase _database;

        public void Init()
        {
            _client = new MongoClient();
            _database = _client.GetDatabase("bridge-mmo");
        }
    }
}
