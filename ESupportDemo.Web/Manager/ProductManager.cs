using ESupportDemo.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ESupportDemo.Web.Manager
{
    public class ProductManager
    {
        private List<Product> _products;
        public ProductManager()
        {
            Load();
        }

        public List<Product> GetProducts()
        {
            try
            {
                return _products;
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        public Product GetProduct(int id)
        {
            try
            {
                if (id > 0)
                {
                    return _products.FirstOrDefault(i => i.ID == id);
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        private void Load()
        {
            _products = new List<Product>()
            {
                new Product(){ID=1,CategoryID=1, Name="LG G5", Stock=0, UnitPrice=1799M,ListPrice=1859M, Status=true},
                new Product(){ID=2,CategoryID=1, Name="Samsung Galaxy S7",Stock=5, UnitPrice=1799M,ListPrice=1859M, Status=true},
                new Product(){ID=3,CategoryID=2, Name="Çamaşır Makinası", Stock=23, UnitPrice=1199M,ListPrice=1289M, Status=true},
                new Product(){ID=4,CategoryID=2, Name="Bulaşık Makinası",Stock=10, UnitPrice=1099M,ListPrice=1279M, Status=false},
                new Product(){ID=5,CategoryID=3, Name="Çaykur Rize Çay",Stock=560, UnitPrice=25.9M,ListPrice=29.9M, Status=true},
                new Product(){ID=6,CategoryID=4, Name="Çizgili Defter", Stock=43, UnitPrice=7.89M,ListPrice=9.99M, Status=false}

            };
        }
    }
}