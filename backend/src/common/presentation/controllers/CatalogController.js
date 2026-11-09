class CatalogController {
  constructor(service, mapper, entityName) {
    this.service = service;
    this.mapper = mapper;
    this.entityName = entityName;
  }

  async create(req, res) {
    try {
      const entity = await this.service.create(req.body);
      return res.status(201).json({
        ok: true,
        message: `${this.entityName} created successfully`,
        data: this.mapper.toResponse(entity),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const entities = await this.service.getAll();
      return res.status(200).json({
        ok: true,
        data: entities.map((entity) => this.mapper.toResponse(entity)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getActivas(req, res) {
    try {
      const entities = await this.service.getActivas();
      return res.status(200).json({
        ok: true,
        data: entities.map((entity) => this.mapper.toResponse(entity)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const entity = await this.service.getById(req.params.id);
      return res.status(200).json({ ok: true, data: this.mapper.toResponse(entity) });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const entity = await this.service.update(req.params.id, req.body);
      return res.status(200).json({
        ok: true,
        message: `${this.entityName} updated successfully`,
        data: this.mapper.toResponse(entity),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.service.delete(req.params.id);
      return res.status(200).json({
        ok: true,
        message: `${this.entityName} deleted successfully`,
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { CatalogController };
