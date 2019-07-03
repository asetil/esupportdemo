using ESupportDemo.Web.Manager;
using System.Web.Mvc;

namespace ESupportDemo.Web.Controllers
{
    public class CategoryController : Controller
    {
        private readonly CategoryManager _categoryManager;

        public CategoryController()
        {
            _categoryManager = new CategoryManager();
        }

        public ActionResult Index()
        {
            var model = _categoryManager.GetCategories();
            return View(model);
        }

        public ActionResult Detail(int id)
        {
            var model = id > 0 ? _categoryManager.GetCategory(id) : new Models.Category();
            return View(model);
        }
    }
}