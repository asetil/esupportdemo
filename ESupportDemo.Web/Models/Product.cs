
namespace ESupportDemo.Web.Models
{
    public class Product : IEntity
    {
        public int ID { get; set; }
        public int CategoryID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Stock { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal ListPrice { get; set; }
        public bool Status { get; set; }
    }
}