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

        public static string connString = "";

        public MongoCRUD(string db)
        {
            var client = new MongoClient(connString);
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

        public T GetRecordById<T>(string table, int id)
        {
            var col = database.GetCollection<T>(table);
            var filter = Builders<T>.Filter.Eq("id", id);

            return col.Find(filter).First();
        }

        public T GetRecordByAccountId<T>(string table, int id)
        {
            var col = database.GetCollection<T>(table);
            var filter = Builders<T>.Filter.Eq("accountId", id);

            return col.Find(filter).First();
        }

        public void UpdateCharacter(Player player)
        {
            var collection = database.GetCollection<DbCharacter>("characters");

            //Hard coded for testing
            var filter = Builders<DbCharacter>.Filter.Eq("id", player.DatabaseId);

            var update = Builders<DbCharacter>.Update.Set("mapId", player.mapId);
            update = update.Set("x", player.posX);
            update = update.Set("y", player.posY);
            update = update.Set("lvl", player.stats[Stat.LVL]);
            update = update.Set("exp", player.stats[Stat.EXP]);

            var result = collection.UpdateOne(filter, update);
        }

        public List<T> GetCharacterItems<T>(int characterId)
        {
            var col = database.GetCollection<T>("uq_items");
            var filter = Builders<T>.Filter.Eq("ownerId", characterId);

            return col.Find(filter).ToList();
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
