-- V6__set_default_categories_for_existing_sites.sql

INSERT INTO site_equipment_categories (site_id, equipment_category_id)
SELECT s.id, ec.id
FROM sites s
CROSS JOIN equipment_categories ec;