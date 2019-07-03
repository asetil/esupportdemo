
namespace ESupportDemo.Web.Models
{
    public class Category : IEntity
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int Order { get; set; }
        public bool Status { get; set; }
    }
}