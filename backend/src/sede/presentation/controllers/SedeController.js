const { CatalogController } = require("../../../common/presentation/controllers/CatalogController");
const { SedeMapper } = require("../../infrastructure/mappings/SedeMapper");

class SedeController extends CatalogController {
  constructor(sedeService) {
    super(sedeService, SedeMapper, "Sede");
  }
}

module.exports = { SedeController };
