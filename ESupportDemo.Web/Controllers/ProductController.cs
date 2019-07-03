using ESupportDemo.Web.Manager;
using System.Web.Mvc;

namespace ESupportDemo.Web.Controllers
{
    public class ProductController : Controller
    {
        private readonly ProductManager _productManager;

        public ProductController()
        {
            _productManager = new ProductManager();
        }

        public ActionResult Index()
        {
            var model = _productManager.GetProducts();
            return View(model);
        }

        public ActionResult Detail(int id)
        {
            var model = id > 0 ? _productManager.GetProduct(id) : new Models.Product();
            return View(model);
        }
    }
}