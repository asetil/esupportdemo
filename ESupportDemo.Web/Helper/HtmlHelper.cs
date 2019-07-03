using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace ESupportDemo.Web.Helper
{
    public static class HtmlExtensions
    {
        public static string ImageRepository = "/resource/img/";
        public static MvcHtmlString ImageFor(this HtmlHelper html, string directory, string imageName, string title = "", string cssClass = "", string alt = "", bool random = false)
        {
            string imageHtml = string.Empty;
            alt = string.IsNullOrEmpty(alt) ? imageName : alt;
            string classInfo = string.IsNullOrEmpty(cssClass) ? string.Empty : "class='" + cssClass + "'";
            string rnd = string.Empty;
            if (random)
            {
                var r = new Random().Next();
                rnd = string.Format("?r={0}", r);
            }

            if (string.IsNullOrEmpty(directory))
            {
                imageHtml = string.Format("<img src='{0}{1}{5}' alt='{4}' title='{2}' {3}/>", ImageRepository, imageName, title, classInfo, alt, rnd);
            }
            else
            {
                imageHtml = string.Format("<img src='{0}{1}/{2}{6}' alt='{5}' title='{3}' {4}/>", ImageRepository, directory, imageName, title, classInfo, alt, rnd);
            }
            return MvcHtmlString.Create(imageHtml);
        }
        public static MvcHtmlString ButtonFor(this HtmlHelper html, string value, string css = "btn-success", string iconCss = "check", string extraProperties = "")
        {
            var iconHtml = string.IsNullOrEmpty(iconCss) ? string.Empty : "<i class='fa fa-" + iconCss + "'></i> ";
            var button = string.Format("<button class='btn {0}' {3}>{1}{2}</button>", css, iconHtml, value, extraProperties);
            return MvcHtmlString.Create(button);
        }

        //public static MvcHtmlString PagingInfo<T>(this HtmlHelper html, SearchResult<T> searchResult, string alias) where T : class
        //{
        //    if (searchResult != null && searchResult.SearchParams != null && (searchResult.TotalSize / searchResult.SearchParams.Size) > 1)
        //    {
        //        var lowerBound = (searchResult.SearchParams.Page - 1) * searchResult.SearchParams.Size;
        //        var upperBound = lowerBound + searchResult.SearchParams.Size;

        //        var htmlString = string.Format("<h5 style='float:left;'><span><b>{0}</b> {1} <b>{2}-{3}</b> arasını görüntülemektesiniz.</span></h5>", searchResult.TotalSize, alias, lowerBound, Math.Min(searchResult.TotalSize, upperBound));
        //        return MvcHtmlString.Create(htmlString);
        //    }
        //    return MvcHtmlString.Create(string.Empty);
        //}


        public static MvcHtmlString StatusFor(this HtmlHelper html, bool status)
        {
            var htmlString = string.Format("<i class='fa fa-{0} status-icon {1}' title='{2}'></i>", 
                status ? "check":"remove",
                status ? "" : "fail",
                status ? "Aktif" : "Pasif");
            
            return MvcHtmlString.Create(htmlString);
        }
    }
}
