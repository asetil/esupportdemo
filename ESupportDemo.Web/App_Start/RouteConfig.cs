using ESupportDemo.Web.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ESupportDemo.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("Content/{*pathInfo}");
            routes.IgnoreRoute("{*favicon}", new { favicon = @"(.*/)?favicon.ico(/.*)?" });

            routes.MapRoute(RouteNames.UsersRoute, "kullanicilar", defaults: new { controller = "User", action = "Index" });
            routes.MapRoute(RouteNames.CategoriesRoute, "kategoriler", defaults: new { controller = "Category", action = "Index" });
            routes.MapRoute(RouteNames.CategoryDetailRoute, "kategori-detay/{name}/{id}", defaults: new { controller = "Category", action = "Detail" });
            routes.MapRoute(RouteNames.ProductsRoute, "urunler", defaults: new { controller = "Product", action = "Index" });
            //routes.MapRoute(RouteNames.CustomerDetailRoute, "firma-detay/{name}/{id}", defaults: new { controller = "Customer", action = "Detail" });
            //routes.MapRoute(RouteNames.CustomerUsersRoute, "{name}/kullanicilar/{customerID}", defaults: new { controller = "User", action = "UserList" });
            //routes.MapRoute(RouteNames.CustomerOrdersRoute, "{name}/siparisler/{customerID}", defaults: new { controller = "Order", action = "Index" });
            //routes.MapRoute(RouteNames.CustomerStoresRoute, "{name}/marketler/{customerID}", new { controller = "Store", action = "Index" });

            routes.MapRoute("Default", "{controller}/{action}/{id}", new { controller = "Home", action = "Index", id = UrlParameter.Optional });
        }
    }
}
