-- V4__migrate_inspection_items_category.sql

ALTER TABLE inspection_items 
ADD COLUMN equipment_category_id BIGINT AFTER category;

UPDATE inspection_items ii
JOIN equipment_categories ec ON ii.category = ec.name
SET ii.equipment_category_id = ec.id;

ALTER TABLE inspection_items 
MODIFY COLUMN equipment_category_id BIGINT NOT NULL;

ALTER TABLE inspection_items DROP COLUMN category;

ALTER TABLE inspection_items
ADD CONSTRAINT fk_inspection_items_category
FOREIGN KEY (equipment_category_id) REFERENCES equipment_categories(id);