using Microsoft.AspNetCore.Mvc;
using MiniMarck.AccesoDatos.Data.Repository.IRepository;
using MiniMarck.Models;
using MiniMarck_Version_3_.Data;

namespace MiniMarck_Version_3_.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class ProveedorController : Controller
    {
        private readonly IContenedorTrabajo _contenedorTrabajo;

        private readonly ApplicationDbContext _context;

        public ProveedorController(IContenedorTrabajo contenedorTrabajo, ApplicationDbContext context)
        {
            _contenedorTrabajo = contenedorTrabajo;
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        //METODO: Create para crear proveedores
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Proveedor proveedor)
        {
            if (ModelState.IsValid)
            {
                _contenedorTrabajo.Proveedor.Add(proveedor);
                _contenedorTrabajo.Save();
                return RedirectToAction(nameof(Index));
            }
            return View(proveedor);
        }

        //METODO: Editar proveedores
        [HttpGet]
        public IActionResult Edit(int id)
        {
            Proveedor proveedor = _contenedorTrabajo.Proveedor.Get(id);
            if (proveedor == null)
            {
                return NotFound();
            }
            return View(proveedor);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(Proveedor proveedor)
        {
            if (ModelState.IsValid)
            {
                _contenedorTrabajo.Proveedor.Update(proveedor);
                _contenedorTrabajo.Save();
                return RedirectToAction(nameof(Index));
            }
            return View(proveedor);
        }

        #region Llamadas API
        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(new { data = _contenedorTrabajo.Proveedor.GetAll() });
        }

        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var objFromDb = _contenedorTrabajo.Proveedor.Get(id);
            if (objFromDb == null)
            {
                return Json(new { success = false, message = "Error borrando proveedor" });
            }

            _contenedorTrabajo.Proveedor.Remove(objFromDb);
            _contenedorTrabajo.Save();
            return Json(new { success = true, message = "Proveedor borrado exitosamente" });
        }
        #endregion
    }
}
