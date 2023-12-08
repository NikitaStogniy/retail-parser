import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Property } from 'src/sequelize/models/property.model';
import { Sequelize } from 'sequelize-typescript';
import { Cluster1 } from 'src/sequelize/models/cluster1.model';
import { Cluster2 } from 'src/sequelize/models/cluster2.model';
import { Cluster3 } from 'src/sequelize/models/cluster3.model';

@Injectable()
export class BotService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(Property)
    private propertyModel: typeof Property,
    @InjectModel(Cluster1)
    private cluster1Model: typeof Cluster1,
    @InjectModel(Cluster2)
    private cluster2Model: typeof Cluster2,
    @InjectModel(Cluster3)
    private cluster3Model: typeof Cluster3,
  ) {}

  async findBestProperty() {
    const results = [];
    try {
      const result1 = await this.findBestPropertyForCluster(this.cluster1Model);
      results.push(result1);
    } catch (error) {
      results.push([]);
      console.error(`Ошибка при обработке кластера 1: ${error}`);
    }

    try {
      const result2 = await this.findBestPropertyForCluster(this.cluster2Model);
      results.push(result2);
    } catch (error) {
      results.push([]);
      console.error(`Ошибка при обработке кластера 2: ${error}`);
    }

    try {
      const result3 = await this.findBestPropertyForCluster(this.cluster3Model);
      results.push(result3);
    } catch (error) {
      results.push([]);
      console.error(`Ошибка при обработке кластера 3: ${error}`);
    }

    return results;
  }

  async findBestPropertyForCluster(
    clusterModel: typeof Cluster1 | typeof Cluster2 | typeof Cluster3,
  ) {
    // Получить случайную квартиру
    const randomProperty = await this.propertyModel.findOne({
      order: this.sequelize.random(),
    });

    if (!randomProperty) {
      throw new Error('No properties found');
    }

    // Найти кластер этой квартиры
    const cluster = await clusterModel.findOne({
      where: { propertyId: randomProperty.id },
    });

    if (!cluster) {
      throw new Error(`No cluster found for property ${randomProperty.id}`);
    }

    // Найти все кластеры с такими же параметрами
    const similarClusters = await clusterModel.findAll({
      where: {
        metroCategory: cluster.metroCategory,
        yearCategory: cluster.yearCategory,
        roomsCategory: cluster.roomsCategory,
        floorCategory: cluster.floorCategory,
        renovationCategory: cluster.renovationCategory,
      },
    });

    // Получить id всех свойств из этих кластеров
    const propertyIds = similarClusters.map((cluster) => cluster.propertyId);

    // Найти самую дешевую квартиру за квадратный метр среди этих свойств
    const cheapestProperty = await this.propertyModel.findOne({
      where: { propid: propertyIds },
      order: ['pricePerMeter'],
    });

    const median = await this.findAveragePricePerMeter(
      cheapestProperty.propid,
      false,
      clusterModel,
    );

    const getHigh = await this.findAveragePricePerMeter(
      cheapestProperty.propid,
      true,
      clusterModel,
    );

    const calcPotentialProfit = await this.calcPotentialProfit(
      cheapestProperty.totalArea,
      cheapestProperty.pricePerMeter,
      getHigh,
    );

    const address = [
      cheapestProperty.city,
      cheapestProperty.district,
      cheapestProperty.historicalDistrict,
      cheapestProperty.metro,
      cheapestProperty.street,
      cheapestProperty.houseNumber,
    ].join(', ');

    const label = this.getLabel(
      calcPotentialProfit,
      cheapestProperty.pricePerMeter,
    );

    const calc = await this.calculatePercentageDifference(
      cheapestProperty.pricePerMeter,
      median,
    );

    const result = {
      id: cheapestProperty.propid,
      address: address,
      footMetro: cheapestProperty.footMetro,
      price: cheapestProperty.price,
      link: cheapestProperty.link,
      median: median,

      difference:
        Math.abs(
          (cheapestProperty.pricePerMeter - median) /
            ((cheapestProperty.pricePerMeter + median) / 2),
        ) * 100,
      potential: calcPotentialProfit,
      label: label,
    };

    return result;
  }

  async findAveragePricePerMeter(
    propID: number,
    getHigh: boolean,
    clusterModel: typeof Cluster1 | typeof Cluster2 | typeof Cluster3,
  ) {
    // Найти кластер этой квартиры
    const cluster = await clusterModel.findOne({
      where: { propertyId: propID },
    });

    console.log('propID', propID);

    console.log('CLUSTER', await cluster);
    console.log('CLUSTERMETRO', await cluster.metroCategory);

    if (!cluster) {
      throw new Error(`No cluster found for propertys ${propID}`);
    }

    const getRenovation = (renovationCategory: number, getHigh: boolean) => {
      if (getHigh) {
        if (renovationCategory < 5) {
          return renovationCategory + 1;
        } else {
          return renovationCategory;
        }
      } else {
        return renovationCategory;
      }
    };
    console.log('RENOVA', getRenovation(cluster.renovationCategory, getHigh));
    // Найти все кластеры с такими же параметрами
    const similarClusters = await clusterModel.findAll({
      where: {
        metroCategory: cluster.metroCategory,
        yearCategory: cluster.yearCategory,
        roomsCategory: cluster.roomsCategory,
        floorCategory: cluster.floorCategory,
        renovationCategory: getRenovation(cluster.renovationCategory, getHigh),
      },
    });

    // Получить id всех свойств из этих кластеров
    const propertyIds = similarClusters.map((cluster) => cluster.propertyId);

    // Найти все квартиры с этими id
    const properties = await this.propertyModel.findAll({
      where: { propid: propertyIds },
    });

    console.log('similarClusters', similarClusters);
    // Вычислить среднюю стоимость за квадратный метр
    const totalCost = properties.reduce(
      (sum, property) => sum + property.pricePerMeter,
      0,
    );
    const averagePricePerMeter = totalCost / properties.length;

    return averagePricePerMeter;
  }

  async calculatePercentageDifference(input1: number, input2: number) {
    console.log('input1', input1);
    console.log('input2', input2);
    const difference =
      Math.abs((input1 - input2) / ((input1 + input2) / 2)) * 100;
    return difference;
  }

  async calcPotentialProfit(
    totalArea: number,
    pricem2: number,
    pricem2high: number,
  ) {
    const profit = (pricem2 + 40000) * totalArea - pricem2high * totalArea;
    return profit;
  }

  getLabel(input1: number, input2: number) {
    const differencePercentage = (input1 / input2) * 100;
    if (differencePercentage > 10) {
      return 'green';
    } else if (differencePercentage > 5) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
}
