using System.Web;
using System.Web.Optimization;

namespace ESupportDemo.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                       "~/resource/js/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/resource/js/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/resource/js/common").Include(
              "~/resource/js/jquery.js",
               "~/resource/js/bootstrap.js",
                "~/resource/js/perfect.scrollbar.js",
              "~/resource/js/aware.js",
              "~/resource/js/site.js"
             ));

            bundles.Add(new ScriptBundle("~/resource/js/loginjs").Include(
              "~/resource/js/jquery.js",
              "~/resource/js/bootstrap.js",
              "~/resource/js/aware.js",
              "~/resource/js/site.js",
              "~/resource/js/user.js"));

            bundles.Add(new StyleBundle("~/resource/css").Include(
                "~/resource/css/bootstrap.css",
                "~/resource/css/admin.new.css",
                 "~/resource/css/font-awesome.css"
            ));

            bundles.Add(new StyleBundle("~/resource/css/logincss").Include(
               "~/resource/css/bootstrap.css",
               "~/resource/css/admin.new.css",
                "~/resource/css/font-awesome.css"));
        }
    }
}
