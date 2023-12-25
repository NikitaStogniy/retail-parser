import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { PropertyDto } from 'src/demand/dto/property.dto';
import { Property } from './models/property.model';
import { globalErrorHandler } from 'src/errorHandler';
import { ClusterDto } from 'src/demand/dto/cluster.dto';
import { Cluster1 } from './models/cluster1.model';
import { Cluster2 } from './models/cluster2.model';
import { Cluster3 } from './models/cluster3.model';
import { Cluster4 } from './models/cluster4.model';
import { Users } from './models/users.model';
import { Op, json } from 'sequelize';
import { UsersDto } from 'src/demand/dto/users.dto';
import { Shown3 } from './models/shown3.model';
import { Shown1 } from './models/shown1.model';
import { Shown2 } from './models/shown2.model';
import { Shown4 } from './models/shown4.model';

@Injectable()
export class SequelizeService {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    await this.sequelize.sync();
  }

  async getUsers() {
    const users = await Users.findAll();
    return users;
  }

  async saveUser(user: number) {
    const userDto = new UsersDto();
    userDto.uid = user.toString();
    try {
      const result = await Users.create(userDto);
      console.log('User created successfully', result);
      return result;
    } catch (error) {}
  }

  async addFlats(values: PropertyDto[]) {
    if (!values.length) {
      console.log('Массив значений пуст');
    }
    try {
      await Property.bulkCreate(values, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      globalErrorHandler(error);
    }
  }

  async addClusters(values: ClusterDto[]) {
    try {
      const clusters = await Cluster1.bulkCreate(values);
      return clusters;
    } catch (error) {
      globalErrorHandler(error);
    }
  }

  async addClusters2(values: ClusterDto[]) {
    try {
      const clusters = await Cluster2.bulkCreate(values);
      return clusters;
    } catch (error) {
      globalErrorHandler(error);
    }
  }

  async addClusters3(values: ClusterDto[]) {
    try {
      const clusters = await Cluster3.bulkCreate(values);
      return clusters;
    } catch (error) {
      globalErrorHandler(error);
    }
  }

  async addClusters4(values: ClusterDto[]) {
    try {
      const clusters = await Cluster4.bulkCreate(values);
      return clusters;
    } catch (error) {
      globalErrorHandler(error);
    }
  }

  async findBestProperty() {
    const results = [];
    try {
      const result1 = await this.findBestPropertyForCluster(Cluster1);

      results.push(result1);
    } catch (error) {
      results.push([]);
      console.log(`Ошибка при обработке кластера 1: ${error}`);
    }

    try {
      const result2 = await this.findBestPropertyForCluster(Cluster2);

      results.push(result2);
    } catch (error) {
      results.push([]);
      console.log(`Ошибка при обработке кластера 4: ${error}`);
    }

    try {
      const result3 = await this.findBestPropertyForCluster(Cluster3);

      results.push(result3);
    } catch (error) {
      globalErrorHandler(error);

      results.push([]);
      console.log(`Ошибка при обработке кластера 4: ${error}`);
    }

    try {
      const result4 = await this.findBestPropertyForCluster(Cluster4);
      if (result4['tradePercent'] <= 15) {
        results.push(result4);
      } else if (result4['tradePercent'] > 0) {
        results.push(result4);
        console.log(`Квартира без торга: ${result4}`);
      }
    } catch (error) {
      results.push([]);
      console.log(`Ошибка при обработке кластера 4: ${error}`);
    }

    return results;
  }

  async findBestPropertyForCluster(
    clusterModel:
      | typeof Cluster1
      | typeof Cluster2
      | typeof Cluster3
      | typeof Cluster4,
  ) {
    const jsonResult = {};
    // Получить случайную квартиру
    const randomProperty = await Property.findOne({
      order: this.sequelize.random(),
    });
    jsonResult['1stProp'] = randomProperty.link;

    if (!randomProperty) {
      console.log('No properties found');
    }

    const cluster = await clusterModel.findOne({
      where: { propertyId: randomProperty.id },
    });

    // jsonResult['1stCluster'] = cluster;

    if (!cluster) {
      console.log(`No cluster found for property ${randomProperty.propid}`);
    }
    const simCluster = await clusterModel.findOne({
      where: { propertyId: randomProperty.propid },
      include: [Property],
    });

    if (!simCluster || !simCluster.property) {
      console.log(`No property found for cluster ${randomProperty.propid}`);
    }
    // Найти все кластеры с такими же параметрами
    let clusters = await this.sequelize.query(
      `
      SELECT * FROM "${clusterModel.name}s" WHERE "yearCategory" = :yearCategory 
      AND "roomsCategory" = :roomsCategory 
      AND "floorCategory" = :floorCategory 
      AND "renovationCategory" = :renovationCategory 
      AND (6371 * acos(cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(lat)))) <= 2
      `,
      {
        replacements: {
          yearCategory: cluster.yearCategory,
          roomsCategory: cluster.roomsCategory,
          floorCategory: cluster.floorCategory,
          renovationCategory: cluster.renovationCategory,
          lat: cluster.lat,
          lng: cluster.lng,
        },
        model: clusterModel,
        mapToModel: true,
      },
    );
    if (!clusters || !clusters.length) {
      console.log(
        `No similar clusters found for property ${randomProperty.id}`,
      );
    }

    // Найти кластер с наименьшей ценой

    let minPriceCluster;
    let shown = true;

    while (shown) {
      minPriceCluster = clusters.reduce((prev, current) =>
        prev.pricePerMeter < current.pricePerMeter ? prev : current,
      );

      shown = await this.isShown(minPriceCluster.id, clusterModel);

      if (shown) {
        // Удалить minPriceCluster из массива clusters
        clusters = clusters.filter(
          (cluster) => cluster.id !== minPriceCluster.id,
        );
      }
    }
    jsonResult['bestCluster'] = minPriceCluster.propertyId;
    //найти property по id
    const minPriceProperty = await Property.findOne({
      where: { propid: minPriceCluster.propertyId },
    });

    jsonResult['minPriceProp'] = minPriceProperty.link;
    const median = await this.getMedianPricePerMeter(clusterModel, cluster);

    const medianProp = await this.findMedianProperty(
      clusterModel,
      cluster,
      median,
    );

    jsonResult['medianPrice'] = median | medianProp.pricePerMeter;
    jsonResult['discount'] = (
      ((1 + minPriceProperty.pricePerMeter - (jsonResult['medianPrice'] + 1)) /
        (jsonResult['medianPrice'] + 1)) *
      -100
    ).toFixed(2);

    jsonResult['medianProp'] = medianProp.link;
    await this.addShown(minPriceProperty.propid, clusterModel);

    const salePrice = await this.calculateSalePrice(
      medianProp.pricePerMeter,
      randomProperty.totalArea,
    );
    const buyoutPrice = await this.calculateBuyoutPrice(
      salePrice,
      randomProperty.totalArea,
    );
    const tradePercent = await this.calculateTradePercent(
      randomProperty.price,
      buyoutPrice,
    );

    jsonResult['salePrice'] = salePrice;
    jsonResult['buyoutPrice'] = buyoutPrice;
    jsonResult['tradePercent'] = tradePercent;

    return jsonResult;
  }

  async getCount() {
    const count = await Property.count();
    return count;
  }

  async addShown(
    propertyId: number,
    clusterModel:
      | typeof Cluster1
      | typeof Cluster2
      | typeof Cluster3
      | typeof Cluster4,
  ) {
    switch (clusterModel.name) {
      case 'Cluster1': {
        const shown = new Shown1();
        shown.propertyId = propertyId;
        await shown.save();
        break;
      }

      case 'Cluster2': {
        const shown = new Shown2();
        shown.propertyId = propertyId;
        await shown.save();
        break;
      }

      case 'Cluster3': {
        const shown = new Shown3();
        shown.propertyId = propertyId;
        await shown.save();
        break;
      }

      case 'Cluster4': {
        const shown = new Shown4();
        shown.propertyId = propertyId;
        await shown.save();
        break;
      }
    }
  }

  async calculateTradePercent(adPrice: number, buyoutPrice: number) {
    const tradePercent = ((adPrice - buyoutPrice) / adPrice) * 100;
    return tradePercent;
  }

  async calculateBuyoutPrice(salePrice: number, area: number) {
    const renovationPrice = area * 45000;
    const buyoutPrice = salePrice * 0.88 - 450000 - renovationPrice;
    return buyoutPrice;
  }

  async calculateSalePrice(pricePerMeter: number, area: number) {
    const salePrice = pricePerMeter * area;
    return salePrice;
  }

  async getMedianPricePerMeter(
    clusterModel:
      | typeof Cluster1
      | typeof Cluster2
      | typeof Cluster3
      | typeof Cluster4,
    cluster: Cluster1 | Cluster2 | Cluster3 | Cluster4,
  ) {
    const distance = this.sequelize.literal(
      `(6371 * acos(cos(radians(${cluster.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${cluster.lng})) + sin(radians(${cluster.lat})) * sin(radians(lat))))`,
    );

    const result = await clusterModel.findAll({
      attributes: [
        'yearCategory',
        'roomsCategory',
        'floorCategory',
        'renovationCategory',
        [
          this.sequelize.fn('AVG', this.sequelize.col('pricePerMeter')),
          'pricePerMeter',
        ],
      ],
      where: {
        lat: { [Op.ne]: null },
        lng: { [Op.ne]: null },
        pricePerMeter: { [Op.ne]: null },
        [Op.and]: this.sequelize.where(distance, '<=', 2),
      },
      group: [
        'yearCategory',
        'roomsCategory',
        'floorCategory',
        'renovationCategory',
      ],
    });
    console.log('result');
    console.log('result', await result[0].dataValues.pricePerMeter);
    return result[0].dataValues.pricePerMeter;
  }

  async findMedianProperty(
    clusterModel:
      | typeof Cluster1
      | typeof Cluster2
      | typeof Cluster3
      | typeof Cluster4,
    cluster: Cluster1 | Cluster2 | Cluster3 | Cluster4,
    medianPrice: number,
  ) {
    const distance = this.sequelize.literal(
      `(6371 * acos(cos(radians(${cluster.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${cluster.lng})) + sin(radians(${cluster.lat})) * sin(radians(lat))))`,
    );

    const result = await clusterModel.findAll({
      where: {
        yearCategory: cluster.yearCategory,
        roomsCategory: cluster.roomsCategory,
        floorCategory: cluster.floorCategory,
        renovationCategory: cluster.renovationCategory,
        lat: { [Op.ne]: null },
        lng: { [Op.ne]: null },
        pricePerMeter: { [Op.ne]: null },
        [Op.and]: this.sequelize.where(distance, '<=', 2),
      },
      order: [
        [
          this.sequelize.literal(`ABS("pricePerMeter" - ${medianPrice})`),
          'ASC',
        ],
      ],
      limit: 1,
    });

    const property = await Property.findOne({
      where: { propid: result[0].propertyId },
    });
    return property;
  }

  async isShown(
    id: number,
    clusterModel:
      | typeof Cluster1
      | typeof Cluster2
      | typeof Cluster3
      | typeof Cluster4,
  ) {
    switch (clusterModel.name) {
      case 'Cluster1': {
        const isShown = await Shown1.findOne({
          where: { propertyId: id },
        });
        if (isShown) {
          return true;
        } else {
          return false;
        }
      }

      case 'Cluster2': {
        const isShown = await Shown2.findOne({
          where: { propertyId: id },
        });
        if (isShown) {
          return true;
        } else {
          return false;
        }
      }

      case 'Cluster3': {
        const isShown = await Shown3.findOne({
          where: { propertyId: id },
        });
        if (isShown) {
          return true;
        } else {
          return false;
        }
      }

      case 'Cluster4': {
        const isShown = await Shown4.findOne({
          where: { propertyId: id },
        });
        if (isShown) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
