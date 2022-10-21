export const arrayCouples = (number)=>{

    const arr = Array(number).fill(0).map((elem,index)=>index);

    const arrCouple = arr.reduce((acc, elem, index, array )=>{
      const restArray = array.slice(index+1);
      if (!restArray.length) return acc;
      const couples = restArray.reduce((acc,e)=>{
        if (e===elem) return acc;
        return [...acc, [elem,e]]
      },[]);
        return [...acc, ...couples]

    }, [])

    return arrCouple

}