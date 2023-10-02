const DAY_MS = 1000 * 3600 * 24
const IMPORTANCE_POW=1.8
const BANDWIDTH_MUL=6
const PADDING_MUL = 2
const MAX_SAMPLES=200


class TrendState {
	static GroupBy = "none"
    static Chart=null
}
function GaussKDE(xi, x, std) {
	return (1 / (Math.sqrt(2 * Math.PI) * std)) * Math.exp(Math.pow((xi - x) / std, 2) / -2)
}

function getSampleDates() {
	const sortedData = DB.data.filter((item) => !item.isPeriod).toSorted((a, b) => getMidTime(b) - getMidTime(a))
	const maxtime = getMidTime(sortedData[0])
	const mintime = getMidTime(sortedData[sortedData.length - 1])
	const span = maxtime - mintime
	const interval = Math.max(DAY_MS, Math.floor(span / MAX_SAMPLES)) //in MS
	const padding = interval * PADDING_MUL
	let dates = []
	for (let timeMS = mintime - padding; timeMS < maxtime + padding; timeMS += interval) {
		//skip duplicate date
		if (dates.length > 0 && dates[dates.length - 1] == timeMS) continue
		dates.push(timeMS)
	}
	return [dates, interval]
}

function getValues() {
	const [dates, interval] = getSampleDates()
	let data = dates.map((d) => {
		return { date: new Date(d).getTime() }
	})
	let inputData = DB.data.filter((item) => !item.isPeriod)
	let series = []
	if (TrendState.GroupBy === "none") {
		populateSeries(dates, data, inputData, "value", interval)
		series.push({
			name: "Interest",
			key: "value",
			color: 4,
		})
	} else if (TrendState.GroupBy === "tag") {
		for (const [tagid,tagObj] of DB.tags.entries()) {
            let filtered=inputData.filter(data=>data.tags.has(tagid))
            if(filtered.length===0) continue
            populateSeries(dates, data,filtered , tagid, interval)

            series.push({
                name: tagObj.name,
                key: tagid,
                color: tagObj.color,
            })
		}
	} else if (TrendState.GroupBy === "color") {
		for (let i = 0; i < COLORS_MID.length; ++i) {
            let filtered=inputData.filter(data=>data.color===String(i))
            
            if(filtered.length===0) continue
            populateSeries(dates, data, filtered, String(i), interval)
            series.push({
                name: "group"+i,
                key: String(i),
                color: i,
            })
        }
	}

	const keys=series.map(s=>s.key)
	normalize(data,keys)
	return [data, series,interval]
}

function normalize(data,keys){
	for(const item of data){
		let total=0
		for(const key of keys){
			total += item[key]
		}
		for(const key of keys){
			item[key+"_norm"] = Math.ceil(1000 * item[key] / total) / 10
		}
		
	}
}

function populateSeries(times, outputData, inputData, key, interval) {
	for (let i = 0; i < outputData.length; ++i) {
		if (!outputData[i]) continue
		const timeMS = times[i]
		for (let j = 0; j < inputData.length; ++j) {
			let kval = GaussKDE(timeMS, getMidTime(inputData[j]), interval * BANDWIDTH_MUL) * inputData[j].importance ** IMPORTANCE_POW
			kval *= 10**9
			if (!outputData[i][key]) outputData[i][key] = kval
			else outputData[i][key] += kval
		}
	}
}

//상위 10% or 상위 N개



async function TrendView() {
	DB.view = VIEW.Trend
	await DatabaseStub.loadData()
    if(TrendState.Chart) TrendState.Chart.dispose()
	const root = am5.Root.new("trend-chartdiv")
	const chart = root.container.children.push(
		am5xy.XYChart.new(root, {
			panY: false,
			panX:true,
			wheelY: "zoomX",
			layout: root.verticalLayout,
			maxTooltipDistance: -1,
		})
	)
    TrendState.Chart=root
	
	
	var [data, seriesInfo,interval] = getValues()
        
	var yRenderer = am5xy.AxisRendererY.new(root, {})
	yRenderer.labels.template.set("visible", false)

	const yAxis = chart.yAxes.push(
		am5xy.ValueAxis.new(root, {
			extraTooltipPrecision: 1,
			renderer: yRenderer,
		})
	)

	var xRenderer = am5xy.AxisRendererX.new(root, {
		minGridDistance: 50,
	});
	xRenderer.grid.template.set("location", 0.5);
	xRenderer.labels.template.setAll({location: 0.5, multiLocation:0.5});


	const xAxis = chart.xAxes.push(
		am5xy.DateAxis.new(root, {
			baseInterval: { timeUnit: "day", count: interval/DAY_MS },
			renderer: xRenderer,
			tooltip: am5.Tooltip.new(root, {})
		})
	)

	var cursor = chart.set("cursor",
	am5xy.XYCursor.new(root, {
		xAxis: xAxis
	}));

	cursor.lineY.set("visible", false);

	function createSeries(name, field, color,labelformat) {
		const series = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: name,
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: field,
				valueXField: "date",
				legendLabelText: "{name}",
				legendRangeLabelText: "{name}",
				fill: am5.color(COLORS_MID[Number(color)]),
				stroke: am5.color(COLORS_MID[Number(color)]),
			})
		)
		var tooltip = series.set("tooltip", am5.Tooltip.new(root, {
			pointerOrientation: "horizontal"
		}));

		tooltip.label.setAll({
			//text:"  "
			text: labelformat
		});
		/*
        series.bullets.push(function(){
            am5.Bullet.new(root, {
                locationY: 0.1,
                sprite: am5.Circle.new(root, {
                    radius: 4,
                    strokeWidth: 2,
                    fill: series.get("fill")
                })
            })
        });*/
		//series.strokes.template.set("strokeWidth", 2)
		series.data.setAll(data)
	}
	let labelformat="[bold]{date.formatDate()}[/]"
	if(TrendState.GroupBy==="none"){
		labelformat+=`\n[width: 130px]Interest[/] {value}`
	}
	else{
		for (const se of seriesInfo) {
			labelformat+=`\n[width: 130px]${se.name}[/] {${se.key}_norm}%`
		}
	}
	for (const se of seriesInfo) {
		createSeries(se.name, se.key, se.color,labelformat)
	}

	let legend = chart.children.push(am5.Legend.new(root, {}))
	legend.data.setAll(chart.series.values)
	xAxis.set(
		"tooltip",
		am5.Tooltip.new(root, {
			themeTags: ["axis"],
		})
	)

	yAxis.set(
		"tooltip",
		am5.Tooltip.new(root, {
			themeTags: ["axis"],
		})
	)
}
