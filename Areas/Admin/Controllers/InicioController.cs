using Microsoft.AspNetCore.Mvc;

namespace MiniMarck_Version_3_.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class InicioController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
