import { useRouter } from 'next/router'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '../context/Context'
import { WithAuth } from '../HOCs/WithAuth'
import Layout from '../layout/Layout'
import { writeUserData } from '../firebase/utils';
import { getDayMonthYear } from "../utils/Fecha";
import Button from '../components/Button'

import style from '../styles/CotizacionTerrestre.module.css'
import dynamic from "next/dynamic";

const InvoicePDF = dynamic(() => import("../components/pdf"), {
    ssr: false,
});

function CotizacionTerrestre() {
    const { userDB, pdfData, setUserPdfData, setUserSuccess } = useUser()
    const router = useRouter()

    const [tarifa, setTarifa] = useState([""])
    const [otrosGastos, setOtrosGastos] = useState([""])
    const [incluye, setIncluye] = useState([""])
    const [excluye, setExcluye] = useState([""])
    const [filter, setFilter] = useState("")
    const [autocomplete, setAutocomplete] = useState(false)
    const [itemSelect, setItemSelect] = useState({})

    const [calc, setCalc] = useState({})

    function handleEventChange(e) {
        let data = e.target.name !== 'nombre' &&
            e.target.name !== 'correo' &&
            e.target.name !== 'empresa' &&
            e.target.name !== 'telefono' &&
            e.target.name !== 'cargo' &&
            e.target.name !== 'ciudad' &&
            e.target.name !== 'ci'
            ? { [`CT-${e.target.name}`]: e.target.value } : { [`${e.target.name}`]: e.target.value }
        setUserPdfData({ ...pdfData, ...data, tarifa, otrosGastos, incluye, excluye })
    }
    function handlerCounter(word) {
        const newTarifa = tarifa.map(i => i)
        newTarifa.pop()
        if (word == "pluss") {
            setUserPdfData({ ...pdfData, tarifa: [...tarifa, ...[""]], otrosGastos, incluye, excluye })
            setTarifa([...tarifa, ...[""]])
        } else {
            setUserPdfData({ ...pdfData, tarifa: newTarifa, otrosGastos, incluye, excluye })
            setTarifa(newTarifa)
        }
    }
    function handlerCounterTwo(word) {
        const newOtrosGastos = otrosGastos.map(i => i)
        newOtrosGastos.pop()
        if (word == "pluss") {
            setUserPdfData({ ...pdfData, tarifa, otrosGastos: [...otrosGastos, ...[""]],  incluye, excluye })
            setOtrosGastos([...otrosGastos, ...[""]])
        } else {
            setUserPdfData({ ...pdfData, tarifa, otrosGastos: newOtrosGastos, incluye, excluye })
            setOtrosGastos(newOtrosGastos)
        }
    }
    function handlerCounterThree(word) {
        const newIncluye = incluye.map(i => i)
        newIncluye.pop()
        word == "pluss" ? setIncluye([...incluye, ...[""]]) : setIncluye(newIncluye)

        if (word == "pluss") {
            setUserPdfData({ ...pdfData, tarifa, otrosGastos,  incluye: [...incluye, ...[""]], excluye })
            setIncluye([...incluye, ...[""]])
        } else {
            setUserPdfData({ ...pdfData, tarifa,  otrosGastos, incluye: newIncluye, excluye })
            setIncluye(newIncluye)
        }
    }
    function handlerCounterFour(word) {
        const newExcluye = excluye.map(i => i)
        newExcluye.pop()
        word == "pluss" ? setExcluye([...excluye, ...[""]]) : setExcluye(newExcluye)
        if (word == "pluss") {
            setUserPdfData({ ...pdfData, tarifa, otrosGastos,  incluye, excluye: [...excluye, ...[""]]})
            setExcluye([...excluye, ...[""]])
        } else {
            setUserPdfData({ ...pdfData, tarifa,  otrosGastos, incluye, excluye: newExcluye })
            setExcluye(newExcluye)
        }
    }


    function handlerPdfButton() {

let cotizacionNo = userDB.CotizacionTerrestre
        setUserPdfData({ ...pdfData, tarifa, otrosGastos, incluye, excluye })
        let object = {
            CotizacionTerrestre: userDB.CotizacionTerrestre ? userDB.CotizacionTerrestre + 1 : 1
        }
        writeUserData('/', object, setUserSuccess)
    }


    function handlerCalc(e, index) {

        console.log(e.target.type)
        e.target.type
        if (e.target.name == `CANTIDADFLETE${index}` && calc[`FLETEUNITARIO${index}`] !== undefined) {
            let object = reducer(e, index, 'FLETEUNITARIO', 'PRODUCTFLETE', 'FLETETOTAL')
            setCalc({ ...calc, ...object })
            setUserPdfData({ ...pdfData, ...calc, ...object })
            return
        }

        if (e.target.name == `FLETEUNITARIO${index}` && calc[`CANTIDADFLETE${index}`] !== undefined) {
            let object = reducer(e, index, 'CANTIDADFLETE', 'PRODUCTFLETE', 'FLETETOTAL')
            setCalc({ ...calc, ...object })
            setUserPdfData({ ...pdfData, ...calc, ...object })
            return
        }

        if (e.target.name == `CANTIDAD${index}` && calc[`COSTOUNITARIO${index}`] !== undefined) {
            let object = reducer(e, index, 'COSTOUNITARIO', 'PRODUCT', 'TOTAL')
            setCalc({ ...calc, ...object })
            setUserPdfData({ ...pdfData, ...calc, ...object })
            return
        }

        if (e.target.name == `COSTOUNITARIO${index}` && calc[`CANTIDAD${index}`] !== undefined) {
            let object = reducer(e, index, 'CANTIDAD', 'PRODUCT', 'TOTAL')
            setCalc({ ...calc, ...object })
            setUserPdfData({ ...pdfData, ...calc, ...object })
            return
        }

        let object = {
            [e.target.name]: e.target.value,

        }
        setCalc({ ...calc, ...object })
        setUserPdfData({ ...pdfData, ...calc, ...object })
    }


    function reducer(e, index, counter, prod, total) {
        let product = e.target.value * calc[`${counter}${index}`]

        let data = {
            ...calc,
            [e.target.name]: e.target.value,
            [`${prod}${index}`]: product,
        }

        let arr = Object.entries(data)

        let red = arr.reduce((ac, i) => {
            let str = i[0]
            if (str.includes(total)) {
                return ac
            }
            if (prod == 'PRODUCT' && str.includes('PRODUCTFLETE')) {
                return ac
            }
            let res = str.includes(prod)
            let r = res ? i[1] + ac : ac
            return r
        }, 0)

        let object = {
            [e.target.name]: e.target.value,
            [`${prod}${index}`]: product,
            PRODUCTOFLETETOTAL: prod === 'PRODUCTFLETE' ? red : data['PRODUCTOFLETETOTAL'],
            PRODUCTOTOTAL: prod === 'PRODUCT' ? red : data['PRODUCTOTOTAL'],
        }
        return object
    }




    function handleFilterChange(e) {
        setFilter(e.target.value)
    }

    function handlerFilterButton(e) {

        e.preventDefault()
        let obj = {
            nombre: '',
            correo: '',
            empresa: '',
            telefono: '',
            cargo: '',
            ciudad: '',
            ci: ''

        }
        let f = userDB.users[filter] ? userDB.users[filter] : obj

        setItemSelect(f)
        setUserPdfData({ ...pdfData, ...f })

        setAutocomplete(true)
        console.log(f)
    }
    console.log(pdfData)




function savai (word) {
}

function complete (word) {
}


    useEffect(() => {
        let cotizacionNo = userDB.CotizacionTerrestre
            ? `${userDB.CotizacionTerrestre + 1 < 10 ? '00' : ''}${userDB.CotizacionTerrestre + 1 > 9
                && userDB.CotizacionTerrestre + 1 < 100 ? '0' : ''}${userDB.CotizacionTerrestre + 1}/${new Date().getFullYear().toString().substring(2, 4)}` : `001/${new Date().getFullYear().toString().substring(2, 4)}`
        let date = getDayMonthYear()


        userDB !== '' && setUserPdfData({
            ...pdfData,
            ["CT-COTIZACIÓN No"]: cotizacionNo,
            ["CT-FECHA"]: date
        })

    }, [userDB, tarifa]);


    return (
        <Layout>
            {userDB && <div className={style.container}>
                <form className={style.form}>

                    <div className={style.containerFilter}>
                        <input className={style.inputFilter} type="text" onChange={handleFilterChange} placeholder='Autocompletar por CI' />
                        <Button style={'buttonSecondary'} click={handlerFilterButton}>Completar</Button>
                    </div>

                    <div className={style.subtitle}>COTIZACIÓN TRANSPORTE TERRESTRE</div>
                    <div className={style.containerFirstItems}>
                        <div className={style.imgForm}>
                            <Image src="/logo.svg" width="250" height="150" alt="User" />
                        </div>
                        <div className={style.firstItems}>
                            <div>
                                <label htmlFor="">COTIZACIÓN No</label>
                                <input type="text" name={"COTIZACIÓN No"} onChange={handleEventChange} defaultValue={pdfData["CT-COTIZACIÓN No"] && pdfData["CT-COTIZACIÓN No"]} />
                            </div>
                            <div>
                                <label htmlFor="">FECHA</label>
                                <input type="text" name={"FECHA"} onChange={handleEventChange} defaultValue={pdfData["CT-FECHA"] && pdfData["CT-FECHA"]} />
                            </div>
                            <div>
                                <label htmlFor="">VALIDEZ</label>
                                <input type="text" name={"VALIDEZ"} onChange={handleEventChange} />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className={style.subtitle}>DATOS DE CLIENTE</div>
                    <br />
                    <div className={style.items}>
                        <div>
                            <label htmlFor="">NOMBRE</label>
                            <input type="text" name={"nombre"} onChange={handleEventChange} defaultValue={itemSelect['nombre'] ? itemSelect['nombre'] : ''} />
                        </div>
                        <div>
                            <label htmlFor="">CORREO</label>
                            <input type="text" name={"correo"} onChange={handleEventChange} defaultValue={itemSelect['correo'] ? itemSelect['correo'] : ''} />
                        </div>
                        <div>
                            <label htmlFor="">EMPRESA</label>
                            <input type="text" name={"empresa"} onChange={handleEventChange} defaultValue={itemSelect['empresa'] ? itemSelect['empresa'] : ''} />
                        </div>
                        <div>
                            <label htmlFor="">TELEFONO</label>
                            <input type="text" name={"telefono"} onChange={handleEventChange} defaultValue={itemSelect['telefono'] ? itemSelect['telefono'] : ''} />
                        </div>
                        <div>
                            <label htmlFor="">CARGO</label>
                            <input type="text" name={"cargo"} onChange={handleEventChange} defaultValue={itemSelect['cargo'] ? itemSelect['cargo'] : ''} />
                        </div>

                        <div>
                            <label htmlFor="">CIUDAD</label>
                            <input type="text" name={"ciudad"} onChange={handleEventChange} defaultValue={itemSelect['ciudad'] ? itemSelect['ciudad'] : ''} />
                        </div>
                    </div>
                    <br />
                    <div className={style.subtitle}>DESCRIPCION DE LA CARGA</div>
                    <br />
                    <div className={style.items}>
                        <div>
                            <label htmlFor="">MERCANCIA</label>
                            <input type="text" name={"MERCANCIA"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">*TIPO DE CARGA</label>
                            <select name="TIPO DE CARGA" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="GENERAL">GENERAL</option>
                                <option value="PELIGROSA">PELIGROSA</option>
                                <option value="ESPECIAL">ESPECIAL</option>
                                <option value="REFRIGERADA">REFRIGERADA</option>
                                <option value="PROYECTO">PROYECTO</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="">EMPAQUE</label>
                            <select name="EMPAQUE" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="CAJAS DE CARTON">CAJAS DE CARTON</option>
                                <option value="CAJAS DE MADERA">CAJAS DE MADERA</option>
                                <option value="CARGA SUELTA">CARGA SUELTA</option>
                                <option value="20`STD">20`STD</option>
                                <option value="20`OT">20`OT</option>
                                <option value="20`FR">20`FR</option>
                                <option value="20`HARD TOP">20`HARD TOP</option>
                                <option value="20`OPEN SIDE">20`OPEN SIDE</option>
                                <option value="20`PLATAFORMA">20`PLATAFORMA</option>
                                <option value="20`RF">20`RF</option>
                                <option value="40`STD">40`STD</option>
                                <option value="40`HQ">40`HQ</option>
                                <option value="40`FR">40`FR</option>
                                <option value="40`OT">40`OT</option>
                                <option value="40`RF">40`RF</option>
                                <option value="40`HARD TOP">40`HARD TOP</option>
                                <option value="40`OPEN SIDE">40`OPEN SIDE</option>
                                <option value="40`PLATAFORMA">40`PLATAFORMA</option>
                                <option value="PALLETIZADO">PALLETIZADO</option>

                            </select>
                        </div>
                        <div>
                            <label htmlFor="">*VOLUMEN M3</label>
                            <input type="text" name={"VOLUMEN M3"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">*PESO TN</label>
                            <input type="text" name={"PESO TN"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">*CANTIDAD</label>
                            <input type="text" name={"CANTIDAD"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">INCOTERM</label>
                            <select name="INCOTERM" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="EXW">EXW</option>
                                <option value="FCA">FCA</option>
                                <option value="CPT">CPT</option>
                                <option value="CIP">CIP</option>
                                <option value="DAP">DAP</option>
                                <option value="DPU">DPU</option>
                                <option value="DDP">DDP</option>
                                <option value="CIF">CIF</option>
                                <option value="CFR">CFR</option>
                                <option value="FOB">FOB</option>
                                <option value="FAS">FAS</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="">MODALIDAD</label>
                            <select name="MODALIDAD" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="FCL">FCL</option>
                                <option value="LTL">LTL</option>
                                <option value="CARGA SUELTA">CARGA SUELTA</option>
                                <option value="DESCONSOLIDADO">DESCONSOLIDADO</option>
                            </select>
                        </div>
                    </div>
                    <br />
                    <div className={style.subtitle}>DETALLES DEL SERVICIO</div>
                    <br />
                    <div className={style.items}>
                        <div>
                            <label htmlFor="">*SERVICIO</label>
                            <select name="SERVICIO" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="NACIONAL">NACIONAL</option>
                                <option value="INTERNACIONAL">INTERNACIONAL</option>
                                <option value="URBANO">URBANO</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="">*TIPO DE UNIDAD</label>
                            <select name="TIPO DE UNIDAD" onChange={handleEventChange}>
                                <option value="">Seleccione una opcion</option>
                                <option value="CAMIONETA">CAMIONETA</option>
                                <option value="CAMION">CAMION</option>
                                <option value="TRAILER">TRAILER</option>
                                <option value="LOWBOY">LOWBOY</option>
                                <option value="CAMION CON ACOPLE">CAMION CON ACOPLE</option>
                                <option value="FURGON CARGA SECA">FURGON CARGA SECA</option>
                                <option value="FURGON CARGA REFRIGERADA">FURGON CARGA REFRIGERADA</option>
                                <option value="PORTA CONTENEDORES">PORTA CONTENEDORES</option>
                                <option value="MODULARES">MODULARES</option>
                                <option value="EXTENSIBLE">EXTENSIBLE</option>
                                <option value="VARIOS">VARIOS</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="">*ORIGEN</label>
                            <input type="text" name={"ORIGEN"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">*DESTINO</label>
                            <input type="text" name={"DESTINO"} onChange={handleEventChange} />
                        </div>
                        <div>
                            <label htmlFor="">*CANTIDAD</label>
                            <input type="text" name={"CANTIDAD"} onChange={handleEventChange} />
                        </div>

                        <div>
                            <label htmlFor="">*MONEDA</label>
                            <input type="text" name={"MONEDA"} onChange={handleEventChange} />
                        </div>
                    </div>
                    <br />
                    <div className={style.subtitle}>TARIFA <span className={style.counterPluss} onClick={() => handlerCounter('pluss')}>+</span> <span className={style.counterLess} onClick={() => handlerCounter('less')}>-</span></div>
                    <br />
                    <div className={`${style.containerFirstItems} ${style.desktop}`}>
                        <span>DETALLE</span>
                        <span>FLETE UNITARIO</span>
                        <span>CANTIDAD</span>
                        <span>FLETE TOTAL</span>
                    </div>
                    {
                        tarifa.map((i, index) => {
                            return (

                                <div className={`${style.inputs}`} key={index}>
                                    <input type="text" name={`DETALLEFLETE${index}`} onChange={handleEventChange} placeholder="DETALLE" />
                                    <input type="number" name={`FLETEUNITARIO${index}`} onChange={(e) => handlerCalc(e, index)} defaultValue={calc[`FLETEUNITARIO${index}`] && calc[`FLETEUNITARIO${index}`]} placeholder="FLETE UNITARIO" />
                                    <input type="number" id='input' name={`CANTIDADFLETE${index}`} onChange={(e) => handlerCalc(e, index)} defaultValue={calc[`CANTIDADFLETE${index}`] && calc[`CANTIDADFLETE${index}`]} placeholder="CANTIDAD" />
                                    <input type="number" defaultValue={calc[`PRODUCTFLETE${index}`] && calc[`PRODUCTFLETE${index}`]} placeholder="FLETE TOTAL" />
                                </div>

                            )
                        })
                    }
                    <div className={`${style.containerFirstItems}`}>
                        <span></span>
                        <span></span>
                        <span>TOTAL FLETES</span>
                        <p>{calc[`PRODUCTOFLETETOTAL`] && calc[`PRODUCTOFLETETOTAL`]}</p>
                    </div>
                    <br />
                    <div className={style.subtitle}>OTROS GASTOS <span className={style.counterPluss} onClick={() => handlerCounterTwo('pluss')}>+</span> <span className={style.counterLess} onClick={() => handlerCounterTwo('less')}>-</span></div>
                    <br />
                    <div className={`${style.containerFirstItems} ${style.desktop}`}>
                        <span>DETALLE</span>
                        <span>COSTO UNITARIO</span>
                        <span>CANTIDAD</span>
                        <span>COSTO TOTAL</span>
                    </div>
                    {
                        otrosGastos.map((i, index) => {
                            return (
                                <div className={`${style.inputs}`} key={index}>
                                    <input type="texto" name={`DETALLE${index}`} onChange={handleEventChange} placeholder="DETALLE" />
                                    <input type="number" name={`COSTOUNITARIO${index}`} onChange={(e) => handlerCalc(e, index)} defaultValue={calc[`COSTOUNITARIO${index}`] && calc[`COSTOUNITARIO${index}`]} placeholder="COSTO UNITARIO" />
                                    <input type="number" name={`CANTIDAD${index}`} onChange={(e) => handlerCalc(e, index)} defaultValue={calc[`CANTIDAD${index}`] && calc[`CANTIDAD${index}`]} placeholder="CANTIDAD" />
                                    <input type="number" defaultValue={calc[`PRODUCT${index}`] && calc[`PRODUCT${index}`]} placeholder="COSTO TOTAL" />
                                </div>
                            )
                        })
                    }
                    <div className={`${style.containerFirstItems}`}>
                        <span></span>
                        <span></span>
                        <span>TOTAL OTROS GASTOS</span>
                        <p>{calc[`PRODUCTOTOTAL`] && calc[`PRODUCTOTOTAL`]}</p>
                    </div>
                    <br />

                    <div className={style.inputsSemi}>
                        <label htmlFor="">Costo Total</label><input type="text" defaultValue={calc.PRODUCTOTOTAL && calc.PRODUCTOFLETETOTAL ? calc.PRODUCTOTOTAL + calc.PRODUCTOFLETETOTAL : (calc.PRODUCTOTOTAL ? calc.PRODUCTOTOTAL : (calc.PRODUCTOFLETETOTAL && calc.PRODUCTOFLETETOTAL))} />
                    </div>

                    <br />

<div className={style.containerFilter}>
                        <Button style={'buttonPrimary'} click={()=>savai('incluye')}>Guardar</Button>

                        <Button style={'buttonSecondary'} click={()=>complete('incluye')}>Completar</Button>
                    </div>
                    <br />

                    <div className={style.subtitle}>INCLUYE <span className={style.counterPluss} onClick={() => handlerCounterThree('pluss')}>+</span> <span className={style.counterLess} onClick={() => handlerCounterThree('less')}>-</span></div>
                    {
                        incluye.map((i, index) => {
                            return (
                                <div className={style.inputsAll} key={index}>
                                    <input type="text" name={`INCLUYE${index}`} onChange={handleEventChange} />
<span className={style.counterLess} onClick={() => handlerCounterThree('less')}>-</span>
                                </div>
                            )
                        })
                    }
                    <br />

<div className={style.containerFilter}>
                        <Button style={'buttonPrimary'} click={()=>savei('excluye')}>Guardar</Button>

                        <Button style={'buttonSecondary'} click={()=>complete('excluye')}>Completar</Button>
                    </div>
                    <br />

<div className={style.subtitle}>EXCLUYE <span className={style.counterPluss} onClick={() => handlerCounterFour('pluss')}>+</span> <span className={style.counterLess} onClick={() => handlerCounterFour('less')}>-</span></div>
                    {
                        excluye.map((i, index) => {
                            return (

                                <div className={style.inputsAll} key={index}>
                                    <input type="text" name={`EXCLUYE${index}`} onChange={handleEventChange} />
<span className={style.counterLess} onClick={() => handlerCounterThree('less')}>-</span>
                                </div>
                            )
                        })
                    }

                    <br />

                    

        



  


                </form>
            </div>}
<div className={style.containerFilter}>
                        <Button style={'buttonPrimary'} click={handlerPdfButton}>Generar N°</Button>



</div>


             
         <InvoicePDF />       
                        
              
            

            <br />
            <br />
        </Layout>
    )
}

export default WithAuth(CotizacionTerrestre)
