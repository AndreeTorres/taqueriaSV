# 📁 Base de Datos

⚠️ **SOLO PARA ADMINISTRADORES**

Los archivos SQL aquí son migraciones y esquemas. **No ejecutes estos archivos a menos que sepas exactamente lo que haces.**

---

## 📋 Archivos Principales

### `schema.sql`
Estructura inicial de la BD. Se ejecuta **solo una vez** al setup inicial.

### `seed.sql`
Datos de ejemplo y usuarios de prueba. Ejecutar después de `schema.sql` en desarrollo.

---

## 🔄 Migraciones

Los archivos `migration_*.sql` contienen cambios a la estructura. Estos se aplican automáticamente en producción.

---

## ⚠️ Cuidado

❌ No ejecutes estos archivos sin saber qué hacen  
❌ No modifiques directamente en producción  
❌ Siempre haz backup antes de cambios  
✅ Contacta al administrador si tienes dudas

---

**Preguntas?** Ver `DEUDA_TECNICA.md` en raíz.
