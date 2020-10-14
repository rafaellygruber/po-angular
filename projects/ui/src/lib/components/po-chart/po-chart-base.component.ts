import { EventEmitter, Input, Output, Directive } from '@angular/core';

import { convertToInt, isTypeof } from '../../utils/util';
import { calculateMaxValue } from './helpers/maths';

import { PoChartGaugeSerie } from './po-chart-types/po-chart-gauge/po-chart-gauge-series.interface';
import { PoChartType } from './enums/po-chart-type.enum';
import { PoDonutChartSeries } from './po-chart-types/po-chart-donut/po-chart-donut-series.interface';
import { PoPieChartSeries } from './po-chart-types/po-chart-pie/po-chart-pie-series.interface';
import { PoLineChartSeries } from './interfaces/po-chart-line-series.interface';
import { PoChartMinMaxValues } from './interfaces/po-chart-min-max-values.interface';
import { PoChartAxisOptions } from './interfaces/po-chart-axis-options.interface';

const poChartDefaultHeight = 400;
const poChartMinHeight = 200;
const poChartTypeDefault = PoChartType.Pie;

export type PoChartSeries = Array<PoDonutChartSeries | PoPieChartSeries | PoChartGaugeSerie | PoLineChartSeries>;

/**
 * @description
 *
 * O `po-chart` é um componente para renderização de dados através de gráficos, com isso facilitando a compreensão e tornando a
 * visualização destes dados mais agradável.
 *
 * Através de suas principais propriedades é possível definir o tipo de gráfico, uma altura e um título.
 *
 * Além disso, também é possível definir uma ação que será executada ao clicar em determinado elemento do gráfico
 * e outra que será executada ao passar o *mouse* sobre o elemento.
 *
 * #### Boas práticas
 *
 * - Para que o gráfico não fique ilegível e incompreensível, evite uma quantia excessiva de séries.
 * - Para exibir a intensidade de um único dado dê preferência ao tipo `gauge`.
 */
@Directive()
export abstract class PoChartBaseComponent {
  private _axisOptions: PoChartAxisOptions;
  private _height: number;
  private _series: Array<PoDonutChartSeries | PoPieChartSeries | PoLineChartSeries> | PoChartGaugeSerie;
  private _type: PoChartType = poChartTypeDefault;

  minMaxValues: PoChartMinMaxValues;

  // manipulação das séries tratadas internamente para preservar 'p-series';
  protected chartSeries: PoChartSeries;

  public readonly poChartType = PoChartType;

  /**
   * @optional
   *
   * @description
   *
   * Define a altura do gráfico.
   *
   * O valor padrão dos gráficos são:
   * - para o tipo *gauge*: `200px`;
   * - para os demais tipos: `400px`.
   *
   * > O valor mínimo aceito nesta propriedade é 200.
   *
   * @default `400px`
   */
  @Input('p-height') set height(value: number) {
    const intValue = convertToInt(value);
    let height: number;

    if (isTypeof(value, 'number')) {
      height = intValue <= poChartMinHeight ? poChartMinHeight : intValue;
    } else {
      height = this.setDefaultHeight();
    }

    this._height = height;

    this.rebuildComponent();
  }

  get height(): number {
    return this._height || this.setDefaultHeight();
  }

  /**
   * @description
   *
   * Define os elementos do gráfico que serão criados dinamicamente.
   *
   * > A coleção de objetos deve implementar alguma das interfaces abaixo:
   * - `PoDonutChartSeries`
   * - `PoPieChartSeries`
   * - `PoChartGaugeSerie`
   */
  @Input('p-series') set series(
    value: PoChartGaugeSerie | Array<PoDonutChartSeries | PoPieChartSeries | PoLineChartSeries>
  ) {
    this._series = value || [];

    if (Array.isArray(this._series)) {
      this.minMaxValues = calculateMaxValue(this._series);
      this.chartSeries = [...this._series];
    } else {
      this.chartSeries = this.transformObjectToArrayObject(this._series);
    }
  }

  get series() {
    return this._series;
  }

  /** Define as categorias das séries. */
  @Input('p-categories') categories?: Array<string>;

  /** Define o título do gráfico. */
  @Input('p-title') title?: string;

  /**
   * @optional
   *
   * @description
   *
   * Define o tipo de gráfico.
   *
   * > Veja os valores válidos no *enum* `PoChartType`.
   *
   * @default `PoChartType.Pie`
   */
  @Input('p-type') set type(value: PoChartType) {
    this._type = (<any>Object).values(PoChartType).includes(value) ? value : poChartTypeDefault;

    this.rebuildComponent();
  }

  get type(): PoChartType {
    return this._type;
  }

  @Input('p-axis-options') set axisOptions(value: PoChartAxisOptions) {
    this._axisOptions = value;
  }

  get axisOptions() {
    return this._axisOptions;
  }

  /**
   * @optional
   *
   * @description
   *
   * Evento executado quando o usuário clicar sobre um elemento do gráfico.
   *
   * > Será passado por parâmetro um objeto contendo a categoria e valor da série.
   */
  @Output('p-series-click')
  seriesClick = new EventEmitter<PoDonutChartSeries | PoPieChartSeries | PoChartGaugeSerie>();

  /**
   * @optional
   *
   * @description
   *
   * Evento executado quando o usuário passar o *mouse* sobre um elemento do gráfico.
   *
   * > Será passado por parâmetro um objeto contendo a categoria e valor da série.
   */
  @Output('p-series-hover')
  seriesHover = new EventEmitter<PoDonutChartSeries | PoPieChartSeries | PoChartGaugeSerie>();

  onSeriesClick(event: any): void {
    this.seriesClick.emit(event);
  }

  onSeriesHover(event: any): void {
    this.seriesHover.emit(event);
  }

  private setDefaultHeight() {
    return this.type === PoChartType.Gauge ? poChartMinHeight : poChartDefaultHeight;
  }

  private transformObjectToArrayObject(serie: PoChartGaugeSerie) {
    return typeof serie === 'object' && Object.keys(serie).length ? [{ ...serie }] : [];
  }

  abstract rebuildComponent(): void;
}
