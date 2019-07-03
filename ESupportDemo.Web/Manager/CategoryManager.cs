using ESupportDemo.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ESupportDemo.Web.Manager
{
    public class CategoryManager
    {
        private List<Category> _categories;
        public CategoryManager()
        {
            Load();
        }

        public List<Category> GetCategories()
        {
            try
            {
                return _categories;
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        public Category GetCategory(int id)
        {
            try
            {
                if (id > 0)
                {
                    return _categories.FirstOrDefault(i => i.ID == id);
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        private void Load()
        {
            _categories = new List<Category>()
            {
                new Category(){ID=1, Name="Cep Telefonu", Order=1, Status=true},
                new Category(){ID=2, Name="Bilgiyar", Order=3, Status=true},
                new Category(){ID=3, Name="Beyaz Eşya", Order=4, Status=true},
                new Category(){ID=4, Name="Temizlik", Order=5, Status=false},
                new Category(){ID=5, Name="Market", Order=12, Status=true},
                new Category(){ID=6, Name="Kırtasiye", Order=11, Status=false}

            };
        }
    }
}