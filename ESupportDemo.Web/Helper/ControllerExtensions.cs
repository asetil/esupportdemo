using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ESupportDemo.Web.Helper
{
    public static class ControllerExtensions
    {
        public static string RenderPartialView(this Controller controller, string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = controller.ControllerContext.RouteData.GetRequiredString("action");

            using (var sw = new StringWriter())
            {
                var viewData = new ViewDataDictionary(model);
                ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(controller.ControllerContext, viewName);
                ViewContext viewContext = new ViewContext(controller.ControllerContext, viewResult.View, viewData, controller.TempData, sw);
                viewResult.View.Render(viewContext, sw);

                return sw.GetStringBuilder().ToString();
            }
        }

        public static string RenderViewToString(this Controller controller, string viewName, object model,
            string masterView = "_Layout")
        {
            if (string.IsNullOrEmpty(viewName))
            {
                viewName = controller.ControllerContext.RouteData.GetRequiredString("action");
            }

            controller.ViewData.Model = model;
            using (var sw = new StringWriter())
            {
                // Find the partial view by its name and the current controller context.
                ViewEngineResult viewResult = ViewEngines.Engines.FindView(controller.ControllerContext, viewName,
                    masterView);

                // Create a view context.
                var viewContext = new ViewContext(controller.ControllerContext, viewResult.View, controller.ViewData,
                    controller.TempData, sw);

                // Render the view using the StringWriter object.
                viewResult.View.Render(viewContext, sw);

                return sw.GetStringBuilder().ToString();
            }
        }

        public static T Value<T>(this TempDataDictionary tempData, string key) where T : class
        {
            try
            {
                if (tempData[key] != null)
                {
                    return (T)tempData[key];
                }
            }
            catch (Exception)
            {

            }
            return default(T);
        }

        public static string GetValue(this HttpRequestBase request, string key)
        {
            try
            {
                var value = request.Form.Get(key);
                if (string.IsNullOrEmpty(value))
                {
                    value = request.QueryString.Get(key);
                }
                return value ?? string.Empty;
            }
            catch (Exception ex)
            {

            }
            return string.Empty;
        }

        public static List<int> GetIDArray(this HttpRequestBase request, string key)
        {
            try
            {
                var value = GetValue(request, key);
                if (!string.IsNullOrEmpty(value))
                {
                    return value.Trim().Trim(',').Split(',')
                        .Select(i => Convert.ToInt32(i))
                        .Where(i => i > 0).ToList();
                }
            }
            catch (Exception ex)
            {

            }
            return new List<int>();
        }
    }
}