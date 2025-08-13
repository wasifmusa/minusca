import { supabase } from '../config/supabaseClient.js';

export const getCategories = async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const getItemsByCategory = async (req, res) => {
  const { categoryName } = req.params;
  const { data: category, error: catError } = await supabase.from('categories').select('id').eq('name', decodeURIComponent(categoryName)).single();
  if (catError) return res.status(404).json({ error: 'Category not found' });

  const { data: items, error: itemsError } = await supabase.from('items').select('*').eq('category_id', category.id).order('serial_number');
  if (itemsError) return res.status(500).json({ error: itemsError.message });
  res.status(200).json(items);
};

export const createItem = async (req, res) => {
  const { category_id, ...itemData } = req.body;
  const { data, error } = await supabase.from('items').insert([{...itemData, category_id}]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('items').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const deleteItem = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Item deleted successfully' });
};


export const exportCategoryAsCsv = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const { data: category, error: catError } = await supabase.from('categories').select('id').eq('name', decodeURIComponent(categoryName)).single();
    if (catError) return res.status(404).json({ error: 'Category not found' });

    const { data, error } = await supabase
      .from('items')
      .select('serial_number,nomenclature,description,ledger_bal_svc,ledger_bal_rep,ledger_bal_us,ground_bal_svc,ground_bal_rep,ground_bal_us,remarks')
      .eq('category_id', category.id)
      .order('serial_number')
      .csv();

    if (error) {
      throw error;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(categoryName)}-inventory.csv"`);
    res.status(200).send(data);
  } catch (err) {
    console.error('Failed to export CSV', err);
    res.status(500).json({ error: 'Failed to export data as CSV' });
  }
};
