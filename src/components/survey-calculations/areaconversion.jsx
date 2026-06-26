import React, { useState } from "react";

function AreaConversion() {


  const units = [
    "square meter",
    "square foot",
    "Acre",
    "Cent",
    "Ground",
    "Ares",
    "Hectare"
  ];



  // Base unit = Square Meter

  const factors = {

    "square meter": 1,

    "square foot": 0.092903,

    "Acre": 4046.8564224,

    "Cent": 40.468564224,

    "Ground": 222.967296,

    "Ares": 100,

    "Hectare": 10000

  };




  const [value1,setValue1] = useState("");

  const [value2,setValue2] = useState("");

  const [unit1,setUnit1] = useState("square meter");

  const [unit2,setUnit2] = useState("Ground");





  function convert(value,from,to){


    if(value==="")
      return "";


    let baseValue =
      Number(value) * factors[from];


    return (

      baseValue / factors[to]

    ).toFixed(4);


  }







  function firstChange(e){

    let val=e.target.value;


    setValue1(val);


    setValue2(

      convert(
        val,
        unit1,
        unit2
      )

    );

  }







  function secondChange(e){

    let val=e.target.value;


    setValue2(val);


    setValue1(

      convert(
        val,
        unit2,
        unit1
      )

    );

  }







  function firstUnitChange(e){


    let newUnit=e.target.value;


    setUnit1(newUnit);


    setValue2(

      convert(
        value1,
        newUnit,
        unit2
      )

    );


  }







  function secondUnitChange(e){


    let newUnit=e.target.value;


    setUnit2(newUnit);


    setValue2(

      convert(
        value1,
        unit1,
        newUnit
      )

    );


  }








  function swapUnits(){


    setUnit1(unit2);

    setUnit2(unit1);


    setValue1(value2);

    setValue2(value1);


  }








  return (


    <div className="area-page">



      <div className="area-card">



        <h2>
          📐 Area Conversion
        </h2>



        <p className="subtitle">
          Land measurement converter
        </p>






        <div className="converter-box">





          <div className="unit-box">


            <label>
              From
            </label>



            <input

              type="number"

              placeholder="Enter area"

              value={value1}

              onChange={firstChange}

            />



            <select

              value={unit1}

              onChange={firstUnitChange}

            >


            {
              units.map(u=>

                <option key={u}>
                  {u}
                </option>

              )

            }


            </select>



          </div>







          <button

            className="swap"

            onClick={swapUnits}

          >

            ⇄

          </button>








          <div className="unit-box">


            <label>
              To
            </label>



            <input

              className="result"

              value={value2}

              readOnly

              placeholder="Result"

            />



            <select

              value={unit2}

              onChange={secondUnitChange}

            >


            {
              units.map(u=>

                <option key={u}>
                  {u}
                </option>

              )

            }


            </select>



          </div>







        </div>


      </div>









<style>{`

.area-page{


min-height:100vh;

display:flex;

justify-content:center;

align-items:center;

background:#f3f6fb;

padding:20px;


}



.area-card{


background:white;

width:100%;

max-width:650px;

padding:35px;

border-radius:22px;

box-shadow:

0 10px 35px rgba(0,0,0,.12);


}




h2{


text-align:center;

margin:0;

font-size:26px;

color:#1f2937;


}





.subtitle{


text-align:center;

color:#6b7280;

margin-top:8px;

margin-bottom:35px;


}







.converter-box{


display:flex;

align-items:center;

justify-content:center;

gap:25px;


}







.unit-box{


display:flex;

flex-direction:column;

gap:12px;


}





label{


font-weight:600;

color:#374151;

font-size:14px;


}







input,select{


width:220px;

padding:14px;

font-size:16px;

border-radius:12px;

border:1px solid #d1d5db;

outline:none;


}





input:focus,
select:focus{


border-color:#2563eb;


}







.result{


background:#eef6ff;

font-weight:600;


}







.swap{


width:50px;

height:50px;

border-radius:50%;

border:none;

background:#2563eb;

color:white;

font-size:26px;

cursor:pointer;


}



.swap:hover{


background:#1d4ed8;


}






.info{


margin-top:25px;

text-align:center;

font-size:14px;

color:#4b5563;

background:#f9fafb;

padding:10px;

border-radius:10px;


}







@media(max-width:600px){



.area-card{


padding:25px;


}



.converter-box{


flex-direction:column;


}



.swap{


transform:rotate(90deg);


}



input,select{


width:100%;

min-width:260px;


}



}



`}</style>





</div>


  );


}


export default AreaConversion;